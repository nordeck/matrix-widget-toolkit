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

import { ElementAvatar } from '@matrix-widget-toolkit/mui';
import BrushIcon from '@mui/icons-material/Brush';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import HexagonIcon from '@mui/icons-material/Hexagon';
import PhishingIcon from '@mui/icons-material/Phishing';
import {
  Alert,
  AlertTitle,
  Autocomplete,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  MouseEventHandler,
  PropsWithChildren,
  ReactElement,
  useId,
  useState,
} from 'react';
import { NavigationBar } from '../NavigationPage';

/**
 * A component that showcases theme UI components can be used.
 */
export const ThemePage = (): ReactElement => {
  return (
    <>
      <NavigationBar title="Theme" />

      <Stack divider={<Divider />}>
        <Intro />
        <ButtonsDemo />
        <TogglesDemo />
        <CardsDemo />
        <DialogsDemo />
        <AlertsDemo />
        <ChipsDemo />
        <TextFieldsDemo />
        <IconsDemo />
        <TooltipsDemo />
        <DropdownDemo />
        <DividersDemo />
        <TypographyDemo />
        <RadioDemo />
        <ListsDemo />
        <AvatarsDemo />
        <TablesDemo />
      </Stack>
    </>
  );
};

export function DemoContainer({ children }: PropsWithChildren) {
  return (
    <Box display="flex" flexWrap="wrap" gap={1} m={1}>
      {children}
    </Box>
  );
}

export function Intro() {
  return (
    <Box m={1}>
      <p>
        This page gives a small overview about building UIs in widget that match
        the design of Element.
      </p>
      <p>
        This example is using{' '}
        <Link href="https://mui.com/" target="_blank" rel="noreferrer">
          Material UI React (Mui)
        </Link>{' '}
        for reusable UI controls and the <code>@matrix-widget-toolkit/mui</code>{' '}
        package to match the design of Element. It's not our goal to match the
        Element design completly and we add additional elements to fit our
        needs.
      </p>

      <Alert severity="info">
        <AlertTitle>Incomplete</AlertTitle>
        This page gives just some ideas and is not a comprehensive list of all
        design elements we use. If you find new ones that should be shared, feel
        free to add them here.
      </Alert>
    </Box>
  );
}

export function ButtonsDemo() {
  return (
    <Box m={1}>
      <Typography variant="h2">Buttons</Typography>
      <p>
        Element uses three kinds of button styles: Primary, secondary and text
        only buttons. Each button can either have a positive (primary theme
        color) or negative color (secondary theme color).
      </p>

      <Typography variant="h3">Primary Buttons</Typography>
      <p>
        Primary buttons have a filled background. Use the <code>variant</code>{' '}
        <code>contained</code> with a <code>color</code> prop of either{' '}
        <code>primary</code> (default) or <code>error</code>.
      </p>

      <DemoContainer>
        <Button variant="contained">Primary Positive</Button>
        <Button variant="contained" color="primary">
          Primary Positive
        </Button>

        <Button variant="contained" color="error">
          Primary Negative
        </Button>

        <Button variant="contained" fullWidth>
          Full Width
        </Button>

        <Button variant="contained" startIcon={<BrushIcon />}>
          Draw
        </Button>

        <Button variant="contained" color="error" startIcon={<DeleteIcon />}>
          Trash
        </Button>

        <IconButton aria-label="Trash">
          <DeleteIcon />
        </IconButton>

        <Button variant="contained" startIcon={<BrushIcon />} disabled>
          Disabled
        </Button>

        <Button
          variant="contained"
          startIcon={<DeleteIcon />}
          color="error"
          disabled
        >
          Disabled
        </Button>

        <IconButton aria-label="Disabled" color="error" disabled>
          <DeleteIcon />
        </IconButton>
      </DemoContainer>

      <Typography variant="h3">Secondary Buttons</Typography>

      <p>
        Secondary buttons are only outlined. Use the <code>variant</code>{' '}
        <code>outlined</code>.
      </p>

      <DemoContainer>
        <Button variant="outlined">Secondary Positive</Button>

        <Button variant="outlined" color="error">
          Secondary Negative
        </Button>

        <Button variant="outlined" startIcon={<BrushIcon />}>
          Secondary Draw
        </Button>

        <Button variant="outlined" startIcon={<BrushIcon />} disabled>
          Disabled
        </Button>

        <Button
          variant="outlined"
          startIcon={<BrushIcon />}
          disabled
          color="error"
        >
          Disabled
        </Button>
      </DemoContainer>

      <Typography variant="h3">Text Only Buttons</Typography>

      <p>
        Text only buttons are used to reveal content or open dialogs. Use the{' '}
        <code>variant</code> <code>text</code> (default).
      </p>

      <DemoContainer>
        <Button variant="text">Text only Positive</Button>

        <Button color="error">Text only Negative</Button>

        <Button variant="text" disabled>
          Text only Disabled
        </Button>

        <Button color="error" disabled>
          Text only Disabled
        </Button>
      </DemoContainer>

      <Typography variant="h3">Button Groups</Typography>

      <p>Sometimes you want to group buttons:</p>

      <DemoContainer>
        <ButtonGroup variant="outlined" fullWidth>
          <Button color="error">Demote User</Button>
          <Button>Promote User</Button>
        </ButtonGroup>
      </DemoContainer>
    </Box>
  );
}

export function TogglesDemo() {
  const [value, setValue] = useState(false);

  return (
    <Box m={1}>
      <Typography component="h2">Toggles</Typography>

      <p>Toggles can be used to turn something on or off.</p>

      <Typography component="h3">As Buttons</Typography>

      <p>This is a style that we use often, but isn't used by Element.</p>

      <DemoContainer>
        <ToggleButton
          value="check"
          selected={value}
          onClick={() => setValue((v) => !v)}
          aria-label="Phishing"
        >
          <BrushIcon />
        </ToggleButton>

        <ToggleButton
          value="check"
          selected={value}
          onClick={() => setValue((v) => !v)}
          color="primary"
          aria-label="Check"
        >
          <CheckIcon />
        </ToggleButton>

        <ToggleButton
          value="check"
          selected={value}
          onClick={() => setValue((v) => !v)}
          color="error"
          aria-label="Phishing"
        >
          <PhishingIcon />
        </ToggleButton>

        <ToggleButton
          value="check"
          selected={value}
          onClick={() => setValue((v) => !v)}
          aria-label="Phishing"
          disabled
        >
          <BrushIcon />
        </ToggleButton>

        <ToggleButton
          value="check"
          selected={value}
          onClick={() => setValue((v) => !v)}
          color="primary"
          aria-label="Check"
          disabled
        >
          <CheckIcon />
        </ToggleButton>

        <ToggleButton
          value="check"
          selected={value}
          onClick={() => setValue((v) => !v)}
          color="error"
          aria-label="Phishing"
          disabled
        >
          <PhishingIcon />
        </ToggleButton>
      </DemoContainer>

      <Typography variant="h3">As Switch</Typography>

      <p>This is a style used by Element.</p>

      <DemoContainer>
        <Switch
          inputProps={{
            'aria-label': 'Turn me on',
          }}
          checked={value}
          onClick={() => setValue((v) => !v)}
        />
      </DemoContainer>
    </Box>
  );
}

export function CardsDemo() {
  return (
    <Box m={1}>
      <Typography variant="h2">Cards</Typography>

      <p>We use Cards to group content together:</p>

      <Card elevation={0}>
        <CardHeader title="Hello World" />
        <CardContent>More Content</CardContent>
      </Card>
    </Box>
  );
}

export function DialogsDemo() {
  const [isOpen, setOpen] = useState(false);
  const [isOpenScrollBody, setOpenScrollBody] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Box m={1}>
      <Typography variant="h2">Dialogs</Typography>

      <p>
        Dialogs can be displayed inside Element or inline inside the widget.
        This section is about inline dialogs. Such dialogs can for example be
        used for confirmations.
      </p>

      <DemoContainer>
        <Button color="primary" fullWidth onClick={() => setOpen(true)}>
          Open Dialog
        </Button>

        <Button
          color="primary"
          fullWidth
          onClick={() => setOpenScrollBody(true)}
        >
          Open Scroll "Body" Dialog
        </Button>

        <Dialog
          open={isOpen}
          onClose={() => setOpen(false)}
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <DialogTitle id={titleId}>This is the Title</DialogTitle>

          <DialogContent>
            <DialogContentText id={descriptionId}>
              Hello World! This is some text to fill this space…
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button variant="outlined" onClick={() => setOpen(false)} autoFocus>
              Cancel
            </Button>
            <Button variant="contained" onClick={() => setOpen(false)}>
              Accept
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isOpenScrollBody}
          scroll="body"
          onClose={() => setOpenScrollBody(false)}
        >
          <DialogContent>
            <DialogContentText>
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
              nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
              erat, sed diam voluptua. At vero eos et accusam et justo duo
              dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
              sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
              amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
              invidunt ut labore et dolore magna aliquyam erat, sed diam
              voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
              Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum
              dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing
              elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore
              magna aliquyam erat, sed diam voluptua. At vero eos et accusam et
              justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
              takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor
              sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
              tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
              voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
              Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum
              dolor sit amet.
            </DialogContentText>
          </DialogContent>
        </Dialog>
      </DemoContainer>
    </Box>
  );
}

export function AlertsDemo() {
  return (
    <Box m={1}>
      <Typography variant="h2">Alerts</Typography>

      <p>
        Alerts should have an <code>AlertTitle</code>.
      </p>

      <Alert severity="error" sx={{ my: 2 }}>
        <AlertTitle>Error</AlertTitle>
        This doesn't work
      </Alert>

      <Alert severity="warning" sx={{ my: 2 }}>
        <AlertTitle>Warning</AlertTitle>
        Use alerts correctly!
      </Alert>

      <Alert severity="info" sx={{ my: 2 }}>
        <AlertTitle>Info</AlertTitle>
        Good to know!
      </Alert>

      <Alert severity="success" sx={{ my: 2 }}>
        <AlertTitle>Success</AlertTitle>
        Alert test completed
      </Alert>
    </Box>
  );
}

export function ChipsDemo() {
  return (
    <Box m={1}>
      <Typography variant="h2">Chips</Typography>

      <p>
        Chips are used in different places they can have different colors and
        filled or outlined variants. Avoid the default color for the filled
        variant and the warning color for the outlined variant as both don't
        match the contrast requirements in high contrast mode.
      </p>

      <Stack direction="row" spacing={1} sx={{ my: 2 }}>
        <Chip label="Error" variant="outlined" color="error" />
        <Chip label="Warning" variant="outlined" color="warning" />
        <Chip label="Primary" variant="outlined" color="primary" />
        <Chip label="Default" variant="outlined" />
      </Stack>
      <Stack direction="row" spacing={1} sx={{ my: 2 }}>
        <Chip label="Error" variant="filled" color="error" />
        <Chip label="Warning" variant="filled" color="warning" />
        <Chip label="Primary" variant="filled" color="primary" />
        <Chip label="Default" variant="filled" />
      </Stack>
    </Box>
  );
}

export function TextFieldsDemo() {
  return (
    <Box m={1}>
      <Typography variant="h2">Text Field</Typography>

      <p>
        Text fields should use the outline variant (default) and small size
        (default).
      </p>

      <DemoContainer>
        <TextField label="Input" />

        <TextField label="Full Width Input" fullWidth placeholder="Fill me…" />

        <TextField label="Disabled Input" disabled />

        <TextField
          label="Invalid Input"
          error
          placeholder="Resolve the error…"
        />
      </DemoContainer>
    </Box>
  );
}

export function IconsDemo() {
  return (
    <Box m={1}>
      <Typography variant="h2">Icons</Typography>

      <p>
        <Link
          href="https://mui.com/material-ui/material-icons/"
          target="_blank"
          rel="noreferrer"
        >
          All icons from Mui
        </Link>{' '}
        can be used (or even extended via{' '}
        <Link
          href="https://mui.com/material-ui/icons/#svgicon"
          target="_blank"
          rel="noreferrer"
        >
          <code>SvgIcons</code>
        </Link>
        ). We should prefer using filled icons, as Element is using them too.
      </p>

      <DemoContainer>
        <DeleteIcon />
        <BrushIcon />
        <HexagonIcon />
      </DemoContainer>
    </Box>
  );
}

export function TooltipsDemo() {
  return (
    <Box m={1}>
      <Typography variant="h2">Tooltips</Typography>

      <p>
        Tooltips can be added to Elements if there are additional details
        needed.
      </p>

      <DemoContainer>
        <Tooltip title="Hello World!">
          <Button variant="contained">Hover Me</Button>
        </Tooltip>
      </DemoContainer>
    </Box>
  );
}

export function DropdownDemo() {
  return (
    <Box m={1}>
      <Typography variant="h2">Dropdown</Typography>

      <p>
        Dropdowns can be used to search for values in a longer lists and to
        select them. All built-in buttons are localized.
      </p>

      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={['user-a', 'user-b', 'user-c']}
        multiple
        renderInput={(params) => (
          <TextField
            {...params}
            label="Users"
            fullWidth
            placeholder="Fill me…"
          />
        )}
      />
    </Box>
  );
}

export function DividersDemo() {
  return (
    <Box m={1}>
      <Typography variant="h2">Dividers</Typography>

      <p>
        A divider can be used to separate content. Dividers can be without
        content:
      </p>

      <Divider />

      <p>
        Or with content. Remember to set the <code>role</code> to{' '}
        <code>presentation</code> to make the content accessible.
      </p>

      <Divider role="presentation">Hello World</Divider>
      <Divider role="presentation">
        <Typography
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: '1',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          This is a very long text inside a divider
        </Typography>
      </Divider>
    </Box>
  );
}

export function TypographyDemo() {
  return (
    <Box m={1}>
      <Typography variant="h2">Typography</Typography>

      <p>We have different styles of typography to use:</p>

      <Typography variant="h1">h1 Heading 1</Typography>
      <Typography variant="h2">h1 Heading 2</Typography>
      <Typography variant="h3">h1 Heading 3</Typography>
      <Typography variant="h4">h1 Heading 4</Typography>
      <Typography variant="h5">h1 Heading 5</Typography>
      <Typography variant="h6">h1 Heading 6</Typography>
      <Typography variant="body1">Text with body1</Typography>
      <Typography variant="body2">Text with body2</Typography>
      <Typography variant="button">Text for buttons</Typography>
      <Typography color="text.secondary">Secondary text color</Typography>
      <Typography color="text.disabled">Disabled text color</Typography>
    </Box>
  );
}

export function RadioDemo() {
  const [state, setState] = useState<string | undefined>('yes');
  const labelId = useId();

  return (
    <Box m={1}>
      <Typography variant="h2">Radio</Typography>

      <p>We have different styles of typography to use:</p>

      <FormControl margin="dense">
        <FormLabel id={labelId}>Do you like it?</FormLabel>

        <RadioGroup
          aria-labelledby={labelId}
          name="doyoulikeit"
          onChange={(event) => setState(event.target.value)}
          value={state}
        >
          <FormControlLabel control={<Radio />} label="Yes" value="yes" />
          <FormControlLabel control={<Radio />} label="No" value="no" />
          <FormControlLabel
            control={<Radio />}
            label="Maybe"
            value="maybe"
            disabled
          />
        </RadioGroup>
      </FormControl>
    </Box>
  );
}

export function ListsDemo() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      <Box m={1}>
        <Typography variant="h2">Lists</Typography>

        <p>
          Lists are a common pattern in our UIs. This is how a selection list
          looks in our theme:
        </p>
      </Box>

      <List aria-label="Widgets">
        {[
          ['Poll Widget', 'A widget to collect votes'],
          ['Meetings Widget', 'Organize meetings in Matrix rooms'],
          ['Whiteboard Widget', 'Collaborative draw or present'],
          ['BarCamp Widget', 'Host BarCamps using Matrix'],
        ].map(([title, description], i) => (
          <WidgetListItem
            key={i}
            selected={i === activeIndex}
            onClick={() => setActiveIndex(i)}
            title={title}
            description={description}
          />
        ))}
      </List>
    </>
  );
}

export function WidgetListItem({
  title,
  description,
  onClick,
  selected,
}: {
  title: string;
  description: string;
  onClick: MouseEventHandler<HTMLDivElement>;
  selected: boolean;
}) {
  const labelId = useId();
  const descriptionId = useId();

  return (
    <li aria-labelledby={labelId} aria-describedby={descriptionId}>
      <ListItemButton selected={selected} onClick={onClick}>
        <ListItemText
          primary={<span id={labelId}>{title}</span>}
          secondary={<span id={descriptionId}>{description}</span>}
        />
      </ListItemButton>
    </li>
  );
}

export function AvatarsDemo() {
  return (
    <Box m={1}>
      <Typography variant="h2">Avatars</Typography>
      <p>Avatars can be used together with users or rooms.</p>
      <Stack direction="row" gap={1} my={1}>
        <ElementAvatar userId="@user:matrix.org" /> Avatar without image and
        name (@user:matrix.org)
      </Stack>
      <Stack direction="row" gap={1} my={1}>
        <ElementAvatar userId="@alice:matrix.org" /> Avatar without image and
        name (@alice:matrix.org)
      </Stack>
      <Stack direction="row" gap={1} my={1}>
        <ElementAvatar userId="@bob:matrix.org" /> Avatar without image and name
        (@bob:matrix.org)
      </Stack>
      <Stack direction="row" gap={1} my={1}>
        <ElementAvatar userId="@charlie:matrix.org" /> Avatar without image and
        name (@charlie:matrix.org)
      </Stack>
      <Stack direction="row" gap={1} my={1}>
        <ElementAvatar userId="@user:matrix.org" displayName="Display Name" />
        Avatar without image
      </Stack>
      <Stack direction="row" gap={1} my={1}>
        <ElementAvatar
          userId="@user:matrix.org"
          displayName="Display Name"
          avatarUrl="https://example.com/test.png"
        />
        Avatar with broken image URL
      </Stack>
      <Stack direction="row" gap={1} my={1}>
        <ElementAvatar
          userId="@user:matrix.org"
          displayName="Display Name"
          avatarUrl="https://example.com/test.png"
        />
        Avatar with broken image URL
      </Stack>
      <Stack direction="row" gap={1} my={1}>
        <ElementAvatar
          userId="@oliver.sand:matrix.org"
          displayName="Oliver Sand"
          avatarUrl="mxc://matrix.org/KbhRFOIJekHQpMVIZGpuNxBG"
        />
        Avatar with mxc: URL (might not resolve)
      </Stack>
      <Stack direction="row" gap={1} my={1}>
        <ElementAvatar
          userId="@oliver.sand:matrix.org"
          displayName="Oliver Sand"
          avatarUrl="https://matrix-client.matrix.org/_matrix/media/r0/download/matrix.org/KbhRFOIJekHQpMVIZGpuNxBG"
        />
        Avatar
      </Stack>
      <Stack direction="row" gap={1} my={1}>
        <ElementAvatar
          userId="@oliver.sand:matrix.org"
          displayName="Oliver Sand"
          avatarUrl="https://matrix-client.matrix.org/_matrix/media/r0/download/matrix.org/KbhRFOIJekHQpMVIZGpuNxBG"
          sx={(theme) => ({
            outline: `${theme.palette.primary.main} solid 2px`,
            border: `2px solid ${theme.palette.background.default}`,
          })}
        />
        Avatar with outline
      </Stack>
      <Stack direction="row" gap={1} my={1}>
        <ElementAvatar
          userId="@oliver.sand:matrix.org"
          displayName="Oliver Sand"
          sx={(theme) => ({
            outline: `${theme.palette.primary.main} solid 2px`,
            border: `2px solid ${theme.palette.background.default}`,

            '&, &&.MuiChip-avatar': {
              fontSize: 16,
            },
          })}
        />
        Avatar with outline without image
      </Stack>
      <Stack direction="row" gap={1} my={1}>
        <ElementAvatar
          userId="@oliver.sand:matrix.org"
          displayName="Oliver Sand"
          avatarUrl="https://matrix-client.matrix.org/_matrix/media/r0/download/matrix.org/KbhRFOIJekHQpMVIZGpuNxBG"
          sx={{ opacity: 0.5 }}
        />
        Avatar with transparency
      </Stack>
      <Stack direction="row" gap={1} my={1}>
        <ElementAvatar
          userId="@oliver.sand:matrix.org"
          displayName="Oliver Sand"
          sx={{
            width: 32,
            height: 32,

            '&, &&.MuiChip-avatar': {
              fontSize: 25,
            },
          }}
        />
        Big avatar
      </Stack>
      <Stack direction="row" gap={1} my={1}>
        <Tooltip title="Hello World">
          <ElementAvatar
            userId="@oliver.sand:matrix.org"
            displayName="Oliver Sand"
          />
        </Tooltip>
        With tooltip
      </Stack>
      <Stack direction="row" gap={1} my={1}>
        <Chip
          size="small"
          avatar={
            <ElementAvatar
              userId="@oliver.sand:matrix.org"
              displayName="Oliver Sand"
              sx={{
                '&, &&.MuiChip-avatar': {
                  fontSize: 15,
                },
              }}
            />
          }
          label="Inside a Chip"
        />
      </Stack>
    </Box>
  );
}

export function TablesDemo() {
  return (
    <>
      <Box m={1}>
        <Typography variant="h2">Tables</Typography>

        <p>
          We sometimes use tables our UIs. This is how a table looks in our
          theme:
        </p>
      </Box>
      <Table size="small" aria-label="Widgets">
        <TableHead>
          <TableRow>
            <TableCell>Widget</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Poll Widget</TableCell>
            <TableCell>A widget to collect votes</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Meetings Widget</TableCell>
            <TableCell>Organize meetings in Matrix rooms</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Whiteboard Widget</TableCell>
            <TableCell>Collaborative draw or present</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>BarCamp Widget</TableCell>
            <TableCell>Host BarCamps using Matrix</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
}

// TODO: Checkbox

// TODO: Spinner

// TODO: Menus
