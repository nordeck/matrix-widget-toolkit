/*
 * Copyright 2024 Nordeck IT + Consulting GmbH
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

import { useWidgetApi } from '@matrix-widget-toolkit/react';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  ImageList,
  ImageListItem,
} from '@mui/material';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import { ReactElement } from 'react';
import { useAsyncRetry } from 'react-use';
import {
  ROOM_EVENT_UPLOADED_IMAGE,
  UploadedImageEvent,
  isValidUploadedImage,
} from '../events';

export const ImageListView = (): ReactElement => {
  const widgetApi = useWidgetApi();
  const {
    value: imageNames = [],
    loading,
    error,
    retry: loadImages,
  } = useAsyncRetry(async () => {
    const events = await widgetApi.receiveRoomEvents<UploadedImageEvent>(
      ROOM_EVENT_UPLOADED_IMAGE,
    );

    return events
      .filter(isValidUploadedImage)
      .sort((a, b) => (a.origin_server_ts > b.origin_server_ts ? -1 : 1));
  }, [widgetApi]);

  return (
    <>
      {imageNames.length === 0 && (
        <Alert severity="info">
          <AlertTitle>No images uploaded to this room yet.</AlertTitle>
          Click the button bellow to refresh.
        </Alert>
      )}
      <Divider sx={{ my: 1 }} />
      <Button
        onClick={loadImages}
        disabled={loading}
        fullWidth
        startIcon={<RefreshIcon />}
      >
        Refresh the Image List
      </Button>

      {imageNames.length > 0 && (
        <>
          <ImageList cols={5}>
            {imageNames.length > 0 &&
              imageNames.map((image) => (
                <ImageListItem key={image.event_id}>
                  <img
                    src={`${getHttpUriForMxc(
                      image.content.url,
                      widgetApi.widgetParameters.baseUrl,
                    )}?w=164&h=164&fit=crop&auto=format`}
                    alt={image.content.name}
                    loading="lazy"
                  />
                  <ImageListItemBar
                    title={image.content.name}
                    subtitle={image.sender}
                  />
                </ImageListItem>
              ))}
          </ImageList>
        </>
      )}

      {error && (
        <Box mx={1}>
          <Alert severity="error" variant="outlined" sx={{ my: 1 }}>
            {error.message}
          </Alert>
        </Box>
      )}
    </>
  );
};

// This is a stripped down implementation of the code that is available in the `matrix-js-sdk`
// For the original version, check
// https://github.com/matrix-org/matrix-js-sdk/blob/1b7695cdca841672d582168a19bfe77f00207fea/src/content-repo.ts#L36
export const getHttpUriForMxc = (
  mxcUrl: string,
  baseUrl: string | undefined,
): string | null => {
  if (mxcUrl.indexOf('mxc://') !== 0) {
    return null;
  }
  let serverAndMediaId = mxcUrl.slice(6);
  let prefix = '/_matrix/media/v3/download/';

  return baseUrl + prefix + serverAndMediaId;
};
