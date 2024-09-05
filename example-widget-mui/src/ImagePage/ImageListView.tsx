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
import { Image } from './Image';

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
                  <Image
                    alt={image.content.name}
                    contentUrl={image.content.url}
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
