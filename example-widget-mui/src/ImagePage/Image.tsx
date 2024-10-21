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
import React, { useCallback, useEffect, useState } from 'react';

type ImageProps = {
  alt?: string;
  /**
   * MXC URI of the image that should be shown
   */
  contentUrl: string;
};

/**
 * Component that loads the image from the content repository and displays it.
 */
export const Image: React.FC<ImageProps> = function ({
  contentUrl,
  ...imageProps
}) {
  const [dataUrl, setDataUrl] = useState<string>();
  const widgetApi = useWidgetApi();

  const handleLoad = useCallback(() => {
    if (dataUrl) {
      URL.revokeObjectURL(dataUrl);
    }
  }, [dataUrl]);

  useEffect(() => {
    (async () => {
      try {
        const result = await widgetApi.downloadFile(contentUrl);

        if (!(result.file instanceof Blob)) {
          throw new Error('Got non Blob file response');
        }

        const downloadedFileDataUrl = URL.createObjectURL(result.file);
        setDataUrl(downloadedFileDataUrl);
      } catch (error) {
        console.log('Error downloading file', error);
      }
    })();
  }, [contentUrl, widgetApi]);

  if (dataUrl === undefined) {
    return null;
  }

  return (
    <img
      style={{ width: '100%' }}
      {...imageProps}
      src={dataUrl}
      onLoad={handleLoad}
    />
  );
};
