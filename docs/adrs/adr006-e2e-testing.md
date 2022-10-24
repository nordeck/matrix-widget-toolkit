# ADR006: Performing Automated End-to-End Tests

Status: accepted

<!-- These documents have names that are short noun phrases. For example, "ADR001: Deployment on Ruby on Rails 3.0.10" or "ADR009: LDAP for Multitenant Integration" -->

## Context

<!--
This section describes the forces at play, including technological, political, social, and project local. These forces are probably in tension, and should be called out as such. The language in this section is value-neutral. It is simply describing facts. -->

Performing releases and deployments should be without fear.
It's all about confidence that our changes don't break the product.
While we already perform tests for isolated components, like unit or integration tests in the individual widgets, we don't know if all parts of the product are working together flawlessly.
This can be tested as part of end-to-end tests.

During an end-to-end test, all components of the product are configured to work together and are tested together.
Here, the individual features or acceptance criterias of the product are tested.
This means that a user is interacting with the UI to perform operations which are stored in a backend.
To verify the result, the data in the UI is evaluated.
The opposite would be to test just the backend by interacting via interfaces, but that can miss the case where the interface between UI and backend isn't working correctly.
For example, the UI and backend might have different expectations

For our widget that means we have to identify the involved components:

- The widget itself,
- the container that hosts the widget source code (Nginx),
- the client that hosts the widget (in our case Element),
- the server that implements the Matrix protocol (like Synapse),
- optional bots that implement server-side behavior,
- the deployment (like Kubernetes manifests),
- and other components (like the integration manager used to install the widgets, a second instance of our widget used by another user, or a different widget that is editing shared event types).

Traditionally such tests are performed manually.
A test plan, describing step by step instructions, is executed manually by testers.
For testers this is a boring and repetitive task.
For the product these kinds of tests are time-consuming and expensive.
Therefore, such tests are often only executed at the end of the project before the delivery of the artifacts.

This traditional method doesn't match modern processes like SCRUM, where artifacts are delivered regularly.
The idea of SCRUM is that the artifacts are always ready for delivery.
Delivering regularly at the end of the sprint means that the testing has to shift left in the development cycle, so that end-to-end tests are executed in every sprint, or even better, with every change.
That way problems can be detected easily and early.
But for a lot of manual tests this can be time-consuming and costly.
This is where automated end-to-end tests come into play.
With automated tests the labor-intensive end-to-end testing can be performed faster and more often.
By running the automated end-to-end test with every change, we can be confident that we can ship our software without fear.

## Decision

<!-- This section describes our response to these forces. It is stated in full sentences, with active voice. "We will ..." -->

To get more confidence that our products are ready to ship, we introduce automated end-to-end tests:

- Our end-to-end tests are executed with every build in the CI pipeline, including pipeline runs in PRs – to make sure that we perform the test regularly.
- Our end-to-end tests are a gatekeeper that make sure that we don't merge any changes the break our product - to make sure that we detect problems early and are always ready to ship a new release.

To make sure that our software really works end-to-end, we focus on black box testing:

- We interact with the product via the visible UI elements and not via programmable APIs.
- We validate the expectations of our tests via visible UI elements and not via programmable APIs.
- We only choose to use programmable APIs in exceptional cases.
- When we test scenarios where multiple users take part in, we run multiple browser sessions.

As we want to develop independent components (so to say Microservices), we test each product in isolation:

- Each product contains an independent test suite.
- In case we have to test interactions between multiple widgets, the tests have to be included in one the of the test suites.
- We run our tests against fresh, independent, and isolated environments.

We use Playwright to write and execute our end-to-end tests:

- The tests are written in TypeScript.
- The tests are split up into multiple spec files, along with the features of the product.
- We run tests for all important Browsers (Google Chrome, Webkit, and Firefox).
- We use a [Page Object pattern](https://martinfowler.com/bliki/PageObject.html) to build up an abstraction level in our tests.
- We set up and teardown the environment as part of the test run.

### Alternatives

The following sections present the alternatives that we have in different categories and the reasons for not using them.

#### Whitebox testing

During Whitebox testing, we know how the internals of the test target work and can take shortcuts when interacting with it.
This includes modifying internal state to get the test target into the state required for our test, or validating internal state to know whether the test target works as expected.
This is what we do in unit and sometimes in integration tests.
For end-to-end tests this could mean that we send events programmatically into the room to get it into a specific state before the test, or that we check that specific events were sent into the room.

During Blackbox testing we only interact with the external visible state of the test target, like APIs or UIs. This means that we use the UI to send events into the room and validate that the UI behaves as expected once they are received.

To be sure that the components really work as they should when a user interacts with them, we should make sure to keep the tests as close to the real user behavior as possible.
This is only possible using black box tests.

There are cases where exceptions can be made:

- _Performing operations via the UI might be slow_, performing them via an API can be faster.
  However, we should not start performance optimizations before they are necessary.
- _Some operations might not be related to our product_, like creating user accounts, logging in into Element, or configuring Element.
  Such operations can be simplified by performing them via APIs.
- _Performing multi-user tests_, for example another user is sending events and the behavior of the receiving widget is validated.
  Such tests can be performed via APIs, but risk to be prone to problems when the event format changes.
  Instead, we should perform the test with a second user in a second browser instance.
  We should not use a single browser instance and switch between users, as the behavior of receiving data at startup and receiving data on the fly might differ.

#### Cypress instead of Playwright

We perform an evaluation of both Cypress and Playwright.
Both tools can be used to perform end-to-end tests.
There are four big areas where they differ in our case:

- _Developer Experience:_ The way of composing, trying, and evaluating tests is
  well more integrated and thought through in Cypress.
  But it's also doable in Playwright – If you are used to Cypress it feels like a step backwards.
- _Execution Model:_ Playwright is an automation tool for Browsers, which controls the Browser from the outside.
  Cypress runs inside the Browser and automates the page under test in an iframe.
  This has an impact on performance, but also has an influence on the next point.
- _Security Limits:_ The way that Cypress is running the application in an iframe means that we run into problems related to cross origin iframes.
  With Cypress we can't test our widget which runs in a cross origin iframe inside of Element.
  We can work around that by disabling web security.
  However, this is only an option in Google Chrome and is actually a significant difference to the production environment that it risks the confidence in our tests.
  Playwright doesn't have this limitation.
- _Browser Limitations:_ As we can use Cypress only with Google Chrome, we can't perform tests with other browsers.
  Playwright doesn't have this limitation and can be used to test our widgets in different Browsers like Google Chrome, Webkit, and Firefox.
  As we want to automate the manual labor, it's not sufficient to automate the tests in Google Chrome only.

Due to these reasons, Cypress is not a good choice for our use case.

#### Performing tests against existing environments

When identifying the components involved, we explicitly listed the deployment as one.
The deployment can include both the cluster setup, but also the widget specific Helm chart deployed in the cluster.

One way of including them is to run the test against existing environments as the QA environment.
This results in some problems:

- We want to start every test run in a _fresh and isolated environment_ and not share it between tests.
  Remains of previous tests might influence other test runs.
- We _don't have direct control over the QA environment_, installing a specific PR build is not possible.
- It is _not good to run multiple parallel tests against the same environment_ at the same time, as they might conflict with each other.

Therefore, we need to start an environment per test run and keep the QA environment for manual tests.
These short running environments don't have to run inside a Kubernetes cluster of a cloud provider.
It's sufficient to run them inside the CI pipeline and decommission them afterwards.
Tools like k3d or minikube might be a choice here.
For the first step we can skip Kubernetes and run our containers directly on Docker.
While this excludes the Helm chart from the test, we already get a quite big coverage of our application.
Testing the Helm chart might not help us for the production environment, as it's assumed that another Helm chart is used there.

#### Central testing project

In the long term it might be interesting to test the whole set-up of our product suite in the customer environment.
This includes the deployment of all widgets and the interactions between them.
For this, a central testing project can be helpful.

But this should be seen as an addition, not the only test suite, because:

- Test can differ from customer to customer environment
- These tests might have a different depth than the application specific end-to-end tests.
  They might not include any feature to speed up the process and increase stability.
  Here this focus would be on the deployment and integration of all the components.
- We might not want to Open Source them, or all of the projects that we have.
  We should keep the option to make them available as Open Source step by step, always including everything that is related to the project.

#### Behavior Driven Development

Behavior Driven Development (BDD) moves the test definition into the requirement gathering process.
This means that the expected behavior of the application is already described before development is started.
The expected behavior is later verified using tests.
The expected behavior is described using a formal language like Gerkin.
This language describes the starting point, the operation, and the expected outcome.
The formal language only includes the condition on the business level, before executing the tests a developer has to translate them into source code and fill out the details.
This concept can be seen as an additional abstraction level on top of our end-to-end tests, making it easier to identify the important test cases and to make sure that the result matches the initial requirements.

However, this approach has some disadvantages:

- One big advantage is focusing on the customer requirements, but we and our customers are not very good at writing down the requirements for stories yet.
  While this might improve using a formal language, we can't really use BDD till we get that sorted out.
- We don't have a lot of experience with using BDD, especially during requirement engineering.
  It's quite easy to get it wrong so that it's just more work without helping us.
- BDD brings another level of abstraction into the already quite complex end-to-end testing setup which we should avoid till everyone is familiar.

However, we should keep the option to adopt BDD later on.

#### Interacting with XRay

The current concept doesn't plan an integration into XRay.
There are two possible scenarios for integrating with XRay:

- _Authoring Gerkin tests that are imported into the tests:_ As long we don't use BDD, we don't need this.
  Later on, it is questionable if an automatic export makes sense, as Gerkin tests can only be executed once a developer implemented them.
- _Publishing test execution results to XRay_: We can upload the results of a test run into XRay via JUnit reports.
  However, as we use the end-to-end tests as a gatekeeper, we would never upload negative results.
  Here it's questionable what use case we want to fulfill.
  However, it is interesting to publish the test results to XRay to see the automatic test coverage and compare it to the manual test coverage.

Therefore, we skip the integration for now and reevaluate possible integrations later.

## Consequences

<!-- This section describes the resulting context, after applying the decision. All consequences should be listed here, not just the "positive" ones. A particular decision may have positive, negative, and neutral consequences, but all of them affect the team and project in the future. -->

The goal of the end-to-end tests is to give us more confidence in changes.

However, the automated, scripted tests can't replace explorative testing where a user goes through the app without a predefined plan.
Explorative testing helps to find issues outside of the user requirements.
Our current end-to-end test will also not be able to detect visual problems like layout regressions or typos.
Therefore, we should still plan time for performing manual tests.

This concept leaves some open questions that we can resolve once we have gathered more experience with the end-to-end tests:

- Do we want to later introduce Behavior Driven Development?
- Do we want to include the Kubernetes deployment, for example the Helm chart in the tests?
- Do we want to perform tests for specific environments like Dataport?
- Do we want to perform an integration with XRay?

In the next steps we can create a full prototype and implement it in a single widget.
Once we have the process ready, we can start to automate all tests for the single widget.
After we have collected more experience, we can start to roll the process out to our other widgets and plan the next steps.

We have to take in mind that the stability of end-to-end test is lower than unit or integration tests, as more components are involved.
It will always be required to watch out for unstable tests and adjust them if necessary.
This will be a long-term learning process.

<!-- This template is taken from a blog post by Michael Nygard http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions -->
