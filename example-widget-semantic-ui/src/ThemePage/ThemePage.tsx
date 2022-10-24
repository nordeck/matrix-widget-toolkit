/*
 * Copyright 2022 Nordeck IT + Consulting GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ReactElement, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Container,
  Divider,
  Header,
  Icon,
  List,
  Message,
  Modal,
  Radio,
  Segment,
} from 'semantic-ui-react';

/**
 * A component that showcases theme UI components can be used.
 */
export const ThemePage = (): ReactElement => {
  return (
    <Container>
      <Button icon labelPosition="left" as={Link} to="/">
        <Icon name="arrow alternate circle left outline" />
        Back to navigation
      </Button>
      <Divider />
      <Intro />
      <Buttons />
      <Toggles />
      <Segments />
      <Dialogs />
      <Icons />
      <Lists />
    </Container>
  );
};

export function Intro() {
  return (
    <>
      <p>
        This page gives a small overview about building UIs in widget that match
        the design of Element.
      </p>
      <p>
        This example is using{' '}
        <a
          href="https://react.semantic-ui.com/"
          target="_blank"
          rel="noreferrer"
        >
          Semantic UI React
        </a>{' '}
        for reusable UI controls and the{' '}
        <code>@matrix-widget-toolkit/semantic-ui</code> package to match the
        design of Element. It's not our goal to match the Element design
        completly and we add additional elements to fit our needs.
      </p>
      <Message
        icon="info circle"
        header="Incomplete"
        content="This page gives just some ideas and is not a comprehensive list of all design elements we use. If you find new ones that should be shared, feel free to add them here."
      />
    </>
  );
}

export function Buttons() {
  return (
    <>
      <Header as="h2">Buttons</Header>
      <p>
        Element uses three kinds of button styles: Primary, secondary and text
        only buttons. Each button can either have a positive (primary theme
        color) or negative color (secondary theme color).
      </p>
      <Header as="h3">Primary Buttons</Header>
      <p>
        Primary buttons have a filled background. Use the <code>primary</code>/
        <code>positive</code> and <code>negative</code> props.
      </p>
      <p>
        <Button primary>Primary Positive</Button>
        <Button positive>Primary Positive</Button>
        <Button negative>Primary Negative</Button>
        <Button positive icon={<Icon className="broom" />}></Button>
        <Button negative icon="trash"></Button>
      </p>
      <Header as="h3">Secondary Buttons</Header>
      <p>
        Secondary buttons are only outlined. Use the <code>basic</code> prop.
      </p>
      <p>
        <Button positive basic>
          Secondary Positive
        </Button>
        <Button negative basic>
          Secondary Negative
        </Button>
        <Button positive basic icon={<Icon className="broom" />}></Button>
        <Button negative basic icon="trash"></Button>
      </p>
      <Header as="h3">Text Only Buttons</Header>
      <p>Text only buttons are used to reveal content or open dialogs:</p>
      <Message
        icon="exclamation triangle"
        error
        header="Not implemented"
        content="Text only buttons are currently not supported by Semantic UI React"
      />
    </>
  );
}

export function Toggles() {
  const [value, setValue] = useState(false);

  return (
    <>
      <Header as="h2">Toggles</Header>
      <p>Toggles can be used to turn something on or off.</p>

      <Header as="h3">As Buttons</Header>
      <p>This is a style that we use often, but isn't used by Element.</p>
      <Button
        basic
        icon="blind"
        active={value}
        onClick={() => setValue((v) => !v)}
      ></Button>
      <Button
        toggle
        icon={<Icon className="fish" />}
        active={value}
        basic
        onClick={() => setValue((v) => !v)}
      />

      <Header as="h3">As Slider</Header>
      <p>This is a style used by Element.</p>
      <Radio toggle checked={value} onClick={() => setValue((v) => !v)} />
    </>
  );
}

export function Dialogs() {
  return (
    <>
      <Header as="h2">Dialogs</Header>
      <p>
        Dialogs can be displayed inside Element or inline inside the widget.
        This section is about inline dialogs. Such dialogs can for example be
        used for confirmations.
      </p>
      <p>
        <Modal
          trigger={
            <Button basic positive>
              Open Dialog
            </Button>
          }
        >
          <Modal.Header>This is the Title</Modal.Header>
          <Modal.Content>Hello World!</Modal.Content>
          <Modal.Actions>
            <Button basic positive>
              Cancel
            </Button>
            <Button positive>Accept</Button>
          </Modal.Actions>
        </Modal>
      </p>
    </>
  );
}

export function Segments() {
  return (
    <>
      <Header as="h2">Segments</Header>
      <p>We use Segments to group content together:</p>
      <Segment>Test</Segment>
    </>
  );
}

export function Icons() {
  return (
    <>
      <Header as="h2">Icons</Header>
      <p>
        We replace the default icons set of Semantic UI React which is based on
        an older version of Fontawsome with a more recent one:
      </p>
      <p>
        <Button icon={<Icon className="broom" />}></Button>
        <Button icon="trash"></Button>
        <Button basic icon="blind"></Button>
      </p>
    </>
  );
}

export function Lists() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      <Header as="h2">Lists</Header>
      <p>
        Lists are a common pattern in our UIs. This is how a selection list
        looks in our theme:
      </p>

      <List selection>
        {[
          ['Poll Widget', 'A widget to collect votes'],
          ['Meetings Widget', 'Organize meetings in Matrix rooms'],
          ['Whiteboard Widget', 'Collaborative draw or present'],
          ['BarCamp Widget', 'Host BarCamps using Matrix'],
        ].map(([title, description], i) => (
          <List.Item
            key={i}
            active={i === activeIndex}
            onClick={() => setActiveIndex(i)}
          >
            <List.Content>
              <List.Header>{title}</List.Header>
              <List.Description>{description}</List.Description>
            </List.Content>
          </List.Item>
        ))}
      </List>
    </>
  );
}

// TODO: Checkbox

// TODO: Textbox

// TODO: Dropdown

// TODO: Spinner

// TODO: Menus

// TODO: Tables

// TODO: Tooltips
