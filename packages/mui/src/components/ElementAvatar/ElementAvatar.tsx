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
import { getColor } from './getColor';
import { getInitialLetter } from './getInitialLetter';

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
})<{ color: string }>(({ theme, color }) => ({
  // increase the specificity of the css selector to override styles of
  // chip or button components that provide their own css for avatars.
  '&, &&.MuiChip-avatar': {
    fontSize: 18,
    background: color,
    color: theme.palette.common.white,
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
        color={getColor(userId)}
        {...props}
      >
        {getInitialLetter(name)}
      </StyledAvatar>
    );
  },
);
