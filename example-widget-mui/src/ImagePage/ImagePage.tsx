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

import { MuiCapabilitiesGuard } from '@matrix-widget-toolkit/mui';
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import ImageIcon from '@mui/icons-material/Image';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Input,
  Typography,
} from '@mui/material';
import {
  EventDirection,
  WidgetApiFromWidgetAction,
  WidgetEventCapability,
} from 'matrix-widget-api';
import { ChangeEvent, ReactElement, useCallback, useId, useState } from 'react';
import { NavigationBar } from '../NavigationPage';
import { StoreProvider } from '../store';
import { ImageListView } from './ImageListView';

import { ROOM_EVENT_UPLOADED_IMAGE, UploadedImageEvent } from '../events';

/**
 * A component that showcases how to upload image files and render them in a widget.
 */
export const ImagePage = (): ReactElement => {
  const widgetApi = useWidgetApi();
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      if (file) {
        setSelectedFile(file);
      }
    },
    [],
  );

  const handleFileUpload = useCallback(() => {
    const uploadImage = async () => {
      if (selectedFile) {
        setLoading(true);
        if (!selectedFile.type.startsWith('image/')) {
          setErrorMessage(
            'Please select a valid image file. You can upload any image format that is supported by the browser.',
          );
          setErrorDialogOpen(true);
          setSelectedFile(null);
          return;
        }

        try {
          const getConfigMedia = await widgetApi.getMediaConfig();
          if (!getConfigMedia) {
            setErrorMessage(
              `Unable to get the media repository configuration.`,
            );
            setErrorDialogOpen(true);
            return;
          }

          const maxUploadSizeBytes = getConfigMedia['m.upload.size'] ?? 0;
          if (maxUploadSizeBytes < selectedFile.size) {
            setErrorMessage(
              `Your file is ${selectedFile.size} bytes, which exceeds the maximum upload size of ${maxUploadSizeBytes}.`,
            );
            setErrorDialogOpen(true);
            setSelectedFile(null);
            return;
          }

          const responseUploadMedia = await widgetApi.uploadFile(selectedFile);
          const url = responseUploadMedia.content_uri;

          await widgetApi.sendRoomEvent<UploadedImageEvent>(
            ROOM_EVENT_UPLOADED_IMAGE,
            { name: selectedFile.name, size: selectedFile.size, url },
          );

          setSelectedFile(null);
        } catch (error) {
          setErrorMessage('An error occurred during file upload: ' + error);
          setErrorDialogOpen(true);
        } finally {
          setLoading(false);
        }
      }
    };

    uploadImage();
  }, [selectedFile, widgetApi]);

  return (
    <>
      <NavigationBar title="Upload File" />
      <Box m={1}>
        <MuiCapabilitiesGuard
          capabilities={[
            WidgetEventCapability.forRoomEvent(
              EventDirection.Receive,
              ROOM_EVENT_UPLOADED_IMAGE,
            ),
            WidgetEventCapability.forRoomEvent(
              EventDirection.Send,
              ROOM_EVENT_UPLOADED_IMAGE,
            ),
            WidgetApiFromWidgetAction.MSC4039UploadFileAction,
            WidgetApiFromWidgetAction.MSC4039DownloadFileAction,
            WidgetApiFromWidgetAction.MSC4039GetMediaConfigAction,
          ]}
        >
          {/*
          The StoreProvider is located here to keep the example small. Normal
          applications would locate it outside of the router to establish a
          single, global store.
          */}
          <StoreProvider>
            <Alert severity="info">
              <AlertTitle>
                Upload image file to media content repository example.
              </AlertTitle>
              Select an image file to upload to the media content repository and
              generate a `net.nordeck.uploaded_image` event in the room.
            </Alert>

            <Card>
              <CardContent
                sx={{
                  display: 'flex',
                  justifyContent: 'start',
                  alignItems: 'center',
                }}
              >
                <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
                  <Input
                    id="file-input"
                    type="file"
                    onChange={handleFileChange}
                    sx={{ display: 'none' }}
                    inputProps={{
                      'data-testid': 'fileInput',
                    }}
                  />
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<ImageIcon />}
                  >
                    Select Image
                  </Button>
                </label>
                {selectedFile && (
                  <Typography variant="body1" sx={{ marginLeft: 2 }}>
                    {selectedFile?.name}
                  </Typography>
                )}
              </CardContent>
            </Card>
            <Grid item xs={12} mt={1}>
              <Button
                onClick={handleFileUpload}
                variant="contained"
                disabled={loading}
                fullWidth
                startIcon={<UploadIcon />}
              >
                Upload
              </Button>
            </Grid>

            <Dialog
              open={errorDialogOpen}
              onClose={() => setErrorDialogOpen(false)}
              data-testid="modal-dialog"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
            >
              <DialogTitle id={titleId}>Unable to upload file</DialogTitle>

              <DialogContent>
                <DialogContentText id={descriptionId}>
                  {errorMessage}
                </DialogContentText>
              </DialogContent>

              <DialogActions>
                <Button
                  variant="contained"
                  onClick={() => setErrorDialogOpen(false)}
                >
                  OK
                </Button>
              </DialogActions>
            </Dialog>

            <ImageListView />
          </StoreProvider>
        </MuiCapabilitiesGuard>
      </Box>
    </>
  );
};
