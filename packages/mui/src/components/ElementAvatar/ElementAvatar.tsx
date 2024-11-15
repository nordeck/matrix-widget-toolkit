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

import { Avatar, AvatarProps, styled } from '@mui/material';
import { forwardRef } from 'react';
import { createAvatarUrl } from './createAvatarUrl';
import { getInitialLetter } from './getInitialLetter';
import { isColorHash, useIdColorHash } from './useIdColorHash';

/**
 * {@link https://github.com/element-hq/compound-design-tokens}
 */
const bgColors = {
  dark: {
    1: '#002600',
    2: '#001b4e',
    3: '#37004e',
    4: '#22006a',
    5: '#450018',
    6: '#470000',
  },
  light: {
    1: '#e0f8d9',
    2: '#e3f5f8',
    3: '#faeefb',
    4: '#f1efff',
    5: '#ffecf0',
    6: '#ffefe4',
  },
};

const colors = {
  dark: {
    1: '#56c02c',
    2: '#21bacd',
    3: '#d991de',
    4: '#ad9cfe',
    5: '#fe84a2',
    6: '#f6913d',
  },
  light: {
    1: '#005f00',
    2: '#00548c',
    3: '#822198',
    4: '#5d26cd',
    5: '#9f0850',
    6: '#9b2200',
  },
};

/**
 * Props for the {@link ElementAvatar} component.
 */
export type ElementAvatarProps = {
  /**
   * The id of the user.
   * Even though the field is called userId, it can also be used to display
   * avatars for rooms.
   */
  userId: string;

  /**
   * The display name of the user.
   * If not provided, the userId is used instead.
   */
  displayName?: string;

  /**
   * The url of the avatar.
   * If not provided, the initial letter based on the display name or userId is used instead.
   */
  avatarUrl?: string;
} & AvatarProps;

const StyledAvatar = styled(Avatar, {
  shouldForwardProp: (p) => p !== 'color',
})<{ colorHash: number }>(({ theme, colorHash }) => ({
  // increase the specificity of the css selector to override styles of
  // chip or button components that provide their own css for avatars.
  '&, &&.MuiChip-avatar': {
    fontSize: 18,
    background: isColorHash(colorHash)
      ? bgColors[theme.palette.mode][colorHash]
      : bgColors[theme.palette.mode][1],
    color: isColorHash(colorHash)
      ? colors[theme.palette.mode][colorHash]
      : colors[theme.palette.mode][1],
  },

  width: 24,
  height: 24,
}));

/**
 * A component to display user and room avatars in the style of Element.
 * @param param0 - {@link ElementAvatarProps}
 */
export const ElementAvatar = forwardRef<HTMLDivElement, ElementAvatarProps>(
  function ElementAvatar(
    { avatarUrl, userId, displayName, ...props }: ElementAvatarProps,
    ref,
  ) {
    const src = avatarUrl ? createAvatarUrl(avatarUrl) : undefined;
    const name = displayName ?? userId;

    return (
      <StyledAvatar
        ref={ref}
        alt=""
        aria-hidden
        src={src}
        colorHash={useIdColorHash(userId)}
        {...props}
      >
        {getInitialLetter(name)}
      </StyledAvatar>
    );
  },
);
