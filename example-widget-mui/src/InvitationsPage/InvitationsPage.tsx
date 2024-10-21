/*
 * Copyright 2023 Nordeck IT + Consulting GmbH
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

import {
  ElementAvatar,
  MuiCapabilitiesGuard,
} from '@matrix-widget-toolkit/mui';
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
} from '@mui/material';
import { MatrixCapabilities } from 'matrix-widget-api';
import { ReactElement, useEffect, useId, useState } from 'react';
import { NavigationBar } from '../NavigationPage';
import { isError } from '../utils';

/**
 * A component that allows the user to query the user directory
 * and invite others into the room.
 */
export const InvitationsPage = (): ReactElement => {
  return (
    <>
      <NavigationBar title="Invitations" />

      <Box my={1}>
        <MuiCapabilitiesGuard
          capabilities={[MatrixCapabilities.MSC3973UserDirectorySearch]}
        >
          <Box m={1}>
            <InvitationsView />
          </Box>
        </MuiCapabilitiesGuard>
      </Box>
    </>
  );
};

export const InvitationsView = (): ReactElement => {
  const [term, setTerm] = useState('');
  const [selected, setSelected] = useState<SearchResults>([]);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);

  const { loading, results, error } = useUserSearchResults(term, 100);

  const listTitleId = useId();

  return (
    <>
      {error && (
        <Alert severity="error" variant="outlined">
          {error.message}
        </Alert>
      )}

      <Stack direction="row" gap={1} my={1}>
        <Autocomplete
          sx={{ flex: 1 }}
          getOptionLabel={(user) => user.userId}
          // disable built-in filtering
          filterOptions={(x) => x}
          options={results}
          includeInputInList
          filterSelectedOptions
          value={selected}
          onChange={(_, value) => setSelected(value)}
          onInputChange={(_, value) => {
            setTerm(value);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Users"
              size="medium"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading && <CircularProgress color="inherit" size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <ListItem {...props}>
              <ListItemIcon sx={{ mr: 1, minWidth: 0 }}>
                <ElementAvatar
                  userId={option.userId}
                  displayName={option.displayName}
                  avatarUrl={option.avatarUrl}
                />
              </ListItemIcon>

              <ListItemText primary={option.displayName ?? option.userId} />
            </ListItem>
          )}
          disablePortal
          multiple
          loading={loading}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              // eslint-disable-next-line react/jsx-key
              <Chip
                avatar={
                  <ElementAvatar
                    userId={option.userId}
                    displayName={option.displayName}
                    avatarUrl={option.avatarUrl}
                  />
                }
                label={option.displayName ?? option.userId}
                {...getTagProps({ index })}
              />
            ))
          }
          noOptionsText={
            term.length === 0 ? 'Type to search for a user…' : 'No users'
          }
          loadingText="Loading..."
        />

        <Button
          variant="contained"
          onClick={() => {
            setInvitedUsers((old) =>
              old.concat(
                selected.map((u) => u.userId).filter((u) => !old.includes(u)),
              ),
            );
            setSelected([]);
          }}
        >
          Invite
        </Button>
      </Stack>

      <Card>
        <CardHeader
          title={`Invited users (${invitedUsers.length})`}
          titleTypographyProps={{ id: listTitleId }}
        />
        <CardContent sx={{ pt: 0 }}>
          <List dense aria-labelledby={listTitleId}>
            {invitedUsers.map((userId) => (
              <ListItem key={userId}>
                <ListItemText primary={userId} />
              </ListItem>
            ))}

            {invitedUsers.length === 0 && (
              <ListItem>
                <ListItemText secondary="Please invite a user" />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>
    </>
  );
};

type SearchResults = Array<{
  userId: string;
  displayName?: string;
  avatarUrl?: string;
}>;

function useUserSearchResults(
  input: string,
  delay: number,
): {
  loading: boolean;
  results: SearchResults;
  error?: Error;
} {
  const widgetApi = useWidgetApi();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<undefined | Error>();
  const [results, setResults] = useState<SearchResults>([]);

  useEffect(() => {
    let ignore = false;

    async function fetchResults() {
      try {
        const { results } = await widgetApi.searchUserDirectory(input);

        if (!ignore) {
          setResults(results);
          setError(undefined);
          setLoading(false);
        }
      } catch (e) {
        if (!ignore && isError(e)) {
          setError(e);
          setLoading(false);
        }
      }
    }

    setLoading(true);
    const timer = setTimeout(fetchResults, delay);

    return () => {
      clearTimeout(timer);
      ignore = true;
    };
  }, [delay, input, widgetApi]);

  return {
    loading,
    results,
    error,
  };
}
