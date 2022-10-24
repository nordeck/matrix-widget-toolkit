# ADR001: Use Architecture Decision Records (ADR) to Document Important Decisions

Status: accepted

<!-- These documents have names that are short noun phrases. For example, "ADR001: Deployment on Ruby on Rails 3.0.10" or "ADR009: LDAP for Multitenant Integration" -->

## Context

Software development is a collaborative process.
Each developed feature is based on a number of architectural decisions that define the direction of a software artifact.
These decisions are in a number of different areas:

- The decision to use a specific software stack.
- The decision for a common coding style.
- A statement to define the key objectives of a product.
- A document to draft out a new feature or a large refactoring.
- A common understanding of the targeted level of software quality.
- …

We are often faced with these kinds of decisions and have no practice to document them properly, yet.
However, written documents are more effective than purely oral conversations:
the latter might be more effective in discussing or drafting issues; the former might be more effective to establish shared knowledge and don't discuss decisions repeatedly.

<!--
This section describes the forces at play, including technological, political, social, and project local. These forces are probably in tension, and should be called out as such. The language in this section is value-neutral. It is simply describing facts. -->

## Decision

We will use Architecture Decision Records (ADR)s to prepare and document architectural decisions.

We will use a template that is based on a blog post by [Michael Nygard](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions) and store ADRs in Markdown files:

```md
# ADR000: [TITLE]

Status: accepted

<!-- These documents have names that are short noun phrases. For example, "ADR001: Deployment on Ruby on Rails 3.0.10" or "ADR009: LDAP for Multitenant Integration" -->

## Context

<!--
This section describes the forces at play, including technological, political, social, and project local. These forces are probably in tension, and should be called out as such. The language in this section is value-neutral. It is simply describing facts. -->

## Decision

<!-- This section describes our response to these forces. It is stated in full sentences, with active voice. "We will ..." -->

## Consequences

<!-- This section describes the resulting context, after applying the decision. All consequences should be listed here, not just the "positive" ones. A particular decision may have positive, negative, and neutral consequences, but all of them affect the team and project in the future. -->

<!-- This template is taken from a blog post by Michael Nygard http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions -->
```

We will not use ADRs to introduce new concepts but see them as a tool to reach and document a decision.
Once a proposal is finished, the ADR presents the decided state and is persisted into the repository.
If a decision needs to be revisited, it will update (i.e. editorial changes) or replace (i.e. a diverging argument) outdated ADRs, if needed.

<!-- This section describes our response to these forces. It is stated in full sentences, with active voice. "We will ..." -->

## Consequences

Each project will establish it's own independent set of ADRs.
The `matrix-widget-toolkit` can host common ADRs that apply to all projects that use this toolkit.
This includes this decision to use ADRs that shouldn't be repeated in other repositories.

We will add the ADR template as a [`docs/adrs/adr000-template.md`](./adr000-template.md) file into every source code repository that should use ADRs.
The ADRs will be numbered and include the title of the ADR in the file name.

When an ADR is prepared, a Pull Request is opened against the respective repository.
All involved parties should agree on the contents, and approve it before it is accepted and merged.

When a ADR is outdated, it is marked as stale.
It shouldn't be deleted.
It can be updated to clarify misunderstandings or do editorial changes.
It shouldn't be edited to change the decision itself.
Ideally, it should be replaced by a newer ADR.
This new ADR will receive a new number and will reference the old ADR by number.

<!-- This section describes the resulting context, after applying the decision. All consequences should be listed here, not just the "positive" ones. A particular decision may have positive, negative, and neutral consequences, but all of them affect the team and project in the future. -->

<!-- This template is taken from a blog post by Michael Nygard http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions -->
