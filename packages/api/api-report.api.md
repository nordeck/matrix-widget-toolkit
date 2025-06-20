## API Report File for "@matrix-widget-toolkit/api"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { Capability } from 'matrix-widget-api';
import { IDownloadFileActionFromWidgetResponseData } from 'matrix-widget-api';
import { IGetMediaConfigActionFromWidgetResponseData } from 'matrix-widget-api';
import { IModalWidgetCreateData } from 'matrix-widget-api';
import { IModalWidgetOpenRequestDataButton } from 'matrix-widget-api';
import { IModalWidgetReturnData } from 'matrix-widget-api';
import { IOpenIDCredentials } from 'matrix-widget-api';
import { IRoomEvent } from 'matrix-widget-api';
import { ISendEventFromWidgetResponseData } from 'matrix-widget-api';
import { IUploadFileActionFromWidgetResponseData } from 'matrix-widget-api';
import { IWidget } from 'matrix-widget-api';
import { IWidgetApiRequest } from 'matrix-widget-api';
import { IWidgetApiRequestData } from 'matrix-widget-api';
import { ModalButtonID } from 'matrix-widget-api';
import { Observable } from 'rxjs';
import { Symbols } from 'matrix-widget-api';
import { UpdateDelayedEventAction } from 'matrix-widget-api';
import { WidgetApi as WidgetApi_2 } from 'matrix-widget-api';
import { WidgetEventCapability } from 'matrix-widget-api';

// @public
export function calculateUserPowerLevel(powerLevelStateEvent: PowerLevelsStateEvent, userId?: string): number;

// @public
export function compareOriginServerTS<T>(a: RoomEvent<T>, b: RoomEvent<T>): number;

// @public
export type EventWithRelatesTo<RelationType extends string> = RoomEvent<{
    'm.relates_to': RelatesTo<RelationType>;
}>;

// @public
export function extractRawWidgetParameters(): Record<string, string>;

// @public
export function extractWidgetApiParameters(): WidgetApiParameters;

// @public
export function extractWidgetParameters(): WidgetParameters;

// @public
export function generateRoomTimelineCapabilities(roomIds: string[] | Symbols.AnyRoom): string[];

// @public
export function generateWidgetRegistrationUrl(options?: {
    pathName?: string;
    includeParameters?: boolean;
    widgetParameters?: Partial<WidgetParameters>;
}): string;

// @public
export function getContent<T>(event: RoomEventOrNewContent<T>): T;

// @public
export function getOriginalEventId<T>(event: RoomEventOrNewContent<T>): string;

// @public
export function getRoomMemberDisplayName(member: StateEvent<RoomMemberStateEventContent>, allRoomMembers?: StateEvent<RoomMemberStateEventContent>[]): string;

// @public
export function hasActionPower(powerLevelStateEvent: PowerLevelsStateEvent | undefined, userId: string | undefined, action: PowerLevelsActions): boolean;

// @public
export function hasRoomEventPower(powerLevelStateEvent: PowerLevelsStateEvent | undefined, userId: string | undefined, eventType: string): boolean;

// @public
export function hasStateEventPower(powerLevelStateEvent: PowerLevelsStateEvent | undefined, userId: string | undefined, eventType: string): boolean;

// @public
export function hasWidgetParameters(widgetApi: WidgetApi): boolean;

// @public
export function isRoomEvent(event: RoomEvent | StateEvent): event is RoomEvent;

// @public
export function isStateEvent(event: RoomEvent | StateEvent): event is StateEvent;

// @public
export function isValidEventWithRelatesTo(event: RoomEvent): event is EventWithRelatesTo<string>;

// @public
export function isValidPowerLevelStateEvent(event: StateEvent<unknown>): event is StateEvent<PowerLevelsStateEvent>;

// @public
export function isValidRedactionEvent(event: RoomEvent<unknown>): event is RedactionRoomEvent;

// @public
export function isValidRoomEvent(event: unknown): event is RoomEvent<any>;

// @public
export function isValidRoomMemberStateEvent(event: StateEvent<unknown>): event is StateEvent<RoomMemberStateEventContent>;

// @public
export function isValidStateEVent(event: unknown): event is StateEvent<any>;

// @public
export function isValidToDeviceMessageEvent(event: unknown): event is ToDeviceMessageEvent<any>;

// @public
export function makeEventFromSendStateEventResult<T>(type: string, stateKey: string, content: T, sender: string, sendResult: ISendEventFromWidgetResponseData): StateEvent<T>;

// @public
export type MembershipState = 'join' | 'invite' | 'leave' | 'ban' | 'knock';

// @public
export function navigateToRoom(widgetApi: WidgetApi, roomId: string, opts?: NavigateToRoomOptions): Promise<void>;

// @public
export type NavigateToRoomOptions = {
    via?: string[];
};

// @public
export type NewContentRelatesTo<T> = EventWithRelatesTo<'m.replace'>['content'] & {
    'm.new_content': T;
};

// @public
export function observeRedactionEvents(widgetApi: WidgetApi): Observable<RedactionRoomEvent>;

// @public
export function parseWidgetId(widgetId: string): WidgetId;

// @public
export type PowerLevelsActions = 'invite' | 'kick' | 'ban' | 'redact';

// @public
export type PowerLevelsStateEvent = {
    events?: {
        [key: string]: number;
    };
    state_default?: number;
    events_default?: number;
    users?: {
        [key: string]: number;
    };
    users_default?: number;
    ban?: number;
    invite?: number;
    kick?: number;
    redact?: number;
};

// @public
export function redactEvent(widgetApi: WidgetApi, eventId: string): Promise<RedactionRoomEvent>;

// @public
export type Redaction = {
    redacts: string;
};

// @public
export type RedactionRoomEvent = RoomEvent<Record<string, never>> & Redaction;

// @public
export type RelatesTo<RelationType extends string> = {
    event_id: string;
    rel_type: RelationType;
};

// @public
export function repairWidgetRegistration(widgetApi: WidgetApi, registration?: WidgetRegistration): Promise<void>;

// @public
export const ROOM_EVENT_REDACTION = "m.room.redaction";

// @public
export type RoomEvent<T = unknown> = Omit<IRoomEvent, 'content' | 'state_key' | 'unsigned'> & {
    content: T;
};

// @public
export type RoomEventOrNewContent<T = unknown> = RoomEvent<T | NewContentRelatesTo<T>>;

// @public
export type RoomMemberStateEventContent = {
    membership: MembershipState;
    displayname?: string | null;
    avatar_url?: string | null;
};

// @public
export function sendStateEventWithEventResult<T>(widgetApi: WidgetApi, type: string, stateKey: string, content: T): Promise<StateEvent<T>>;

// @public
export const STATE_EVENT_POWER_LEVELS = "m.room.power_levels";

// @public
export const STATE_EVENT_ROOM_MEMBER = "m.room.member";

// @public
export type StateEvent<T = unknown> = Omit<IRoomEvent, 'content' | 'unsigned' | 'state_key'> & {
    state_key: string;
    content: T;
};

// @public
export type ToDeviceMessageEvent<T = unknown> = {
    type: string;
    sender: string;
    encrypted: boolean;
    content: T;
};

// @public
export type TurnServer = {
    urls: string[];
    username: string;
    credential: string;
};

// @public
export const WIDGET_CAPABILITY_NAVIGATE = "org.matrix.msc2931.navigate";

// @public
export type WidgetApi = {
    readonly widgetId: string;
    readonly widgetParameters: Readonly<WidgetParameters>;
    getWidgetConfig<T extends IWidgetApiRequestData>(): Readonly<WidgetConfig<T> | undefined>;
    rerequestInitialCapabilities(): Promise<void>;
    hasInitialCapabilities(): boolean;
    requestCapabilities(capabilities: Array<WidgetEventCapability | Capability>): Promise<void>;
    hasCapabilities(capabilities: Array<WidgetEventCapability | Capability>): boolean;
    receiveSingleStateEvent<T>(eventType: string, stateKey?: string): Promise<StateEvent<T> | undefined>;
    receiveStateEvents<T>(eventType: string, options?: {
        stateKey?: string;
        roomIds?: string[] | Symbols.AnyRoom;
    }): Promise<StateEvent<T>[]>;
    observeStateEvents<T>(eventType: string, options?: {
        stateKey?: string;
        roomIds?: string[] | Symbols.AnyRoom;
    }): Observable<StateEvent<T>>;
    sendStateEvent<T>(eventType: string, content: T, options?: {
        roomId?: string;
        stateKey?: string;
    }): Promise<ISendEventFromWidgetResponseData>;
    sendDelayedStateEvent<T>(eventType: string, content: T, delay: number, options?: {
        roomId?: string;
        stateKey?: string;
    }): Promise<{
        delay_id: string;
    }>;
    receiveRoomEvents<T>(eventType: string, options?: {
        messageType?: string;
        roomIds?: string[] | Symbols.AnyRoom;
    }): Promise<Array<RoomEvent<T>>>;
    observeRoomEvents<T>(eventType: string, options?: {
        messageType?: string;
        roomIds?: string[] | Symbols.AnyRoom;
    }): Observable<RoomEvent<T>>;
    sendRoomEvent<T>(eventType: string, content: T, options?: {
        roomId?: string;
    }): Promise<RoomEvent<T>>;
    sendDelayedRoomEvent<T>(eventType: string, content: T, delay: number, options?: {
        roomId?: string;
    }): Promise<{
        delay_id: string;
    }>;
    updateDelayedEvent(delayId: string, action: UpdateDelayedEventAction): Promise<void>;
    readEventRelations(eventId: string, options?: {
        roomId?: string;
        limit?: number;
        from?: string;
        relationType?: string;
        eventType?: string;
        direction?: 'f' | 'b';
    }): Promise<{
        chunk: Array<RoomEvent | StateEvent>;
        nextToken?: string;
    }>;
    sendToDeviceMessage<T>(eventType: string, encrypted: boolean, content: {
        [userId: string]: {
            [deviceId: string | '*']: T;
        };
    }): Promise<void>;
    observeToDeviceMessages<T>(eventType: string): Observable<ToDeviceMessageEvent<T>>;
    openModal<T extends Record<string, unknown> = Record<string, unknown>, U extends IModalWidgetCreateData = IModalWidgetCreateData>(pathName: string, name: string, options?: {
        buttons?: IModalWidgetOpenRequestDataButton[];
        data?: U;
    }): Promise<T | undefined>;
    setModalButtonEnabled(buttonId: ModalButtonID, isEnabled: boolean): Promise<void>;
    observeModalButtons(): Observable<ModalButtonID>;
    closeModal<T extends IModalWidgetReturnData>(data?: T): Promise<void>;
    navigateTo(uri: string): Promise<void>;
    requestOpenIDConnectToken(): Promise<IOpenIDCredentials>;
    observeTurnServers(): Observable<TurnServer>;
    searchUserDirectory(searchTerm: string, options?: {
        limit?: number;
    }): Promise<{
        results: Array<{
            userId: string;
            displayName?: string;
            avatarUrl?: string;
        }>;
    }>;
    getMediaConfig(): Promise<IGetMediaConfigActionFromWidgetResponseData>;
    uploadFile(file: XMLHttpRequestBodyInit): Promise<IUploadFileActionFromWidgetResponseData>;
    downloadFile(contentUrl: string): Promise<IDownloadFileActionFromWidgetResponseData>;
};

// @public
export class WidgetApiImpl implements WidgetApi {
    constructor(
    matrixWidgetApi: WidgetApi_2,
    widgetId: string,
    widgetParameters: WidgetParameters, { capabilities, supportStandalone }?: WidgetApiOptions);
    closeModal<T extends IModalWidgetReturnData>(data?: T): Promise<void>;
    static create({ capabilities, supportStandalone, }?: WidgetApiOptions): Promise<WidgetApi>;
    downloadFile(contentUrl: string): Promise<IDownloadFileActionFromWidgetResponseData>;
    getMediaConfig(): Promise<IGetMediaConfigActionFromWidgetResponseData>;
    getWidgetConfig<T extends IWidgetApiRequestData>(): Readonly<WidgetConfig<T> | undefined>;
    hasCapabilities(capabilities: Array<WidgetEventCapability | Capability>): boolean;
    hasInitialCapabilities(): boolean;
    initialize(): Promise<void>;
    readonly matrixWidgetApi: WidgetApi_2;
    navigateTo(uri: string): Promise<void>;
    observeModalButtons(): Observable<ModalButtonID>;
    observeRoomEvents<T>(eventType: string, { messageType, roomIds, }?: {
        messageType?: string;
        roomIds?: string[] | Symbols.AnyRoom;
    }): Observable<RoomEvent<T>>;
    observeStateEvents<T>(eventType: string, { stateKey, roomIds, }?: {
        stateKey?: string;
        roomIds?: string[] | Symbols.AnyRoom;
    }): Observable<StateEvent<T>>;
    observeToDeviceMessages<T>(eventType: string): Observable<ToDeviceMessageEvent<T>>;
    observeTurnServers(): Observable<TurnServer>;
    openModal<T extends Record<string, unknown> = Record<string, unknown>, U extends IModalWidgetCreateData = IModalWidgetCreateData>(pathName: string, name: string, options?: {
        buttons?: IModalWidgetOpenRequestDataButton[];
        data?: U;
    }): Promise<T | undefined>;
    readEventRelations(eventId: string, options?: {
        roomId?: string;
        limit?: number;
        from?: string;
        relationType?: string;
        eventType?: string;
        direction?: 'f' | 'b';
    }): Promise<{
        chunk: Array<RoomEvent | StateEvent>;
        nextToken?: string;
    }>;
    receiveRoomEvents<T>(eventType: string, { messageType, roomIds, }?: {
        messageType?: string;
        roomIds?: string[] | Symbols.AnyRoom;
    }): Promise<Array<RoomEvent<T>>>;
    receiveSingleStateEvent<T>(eventType: string, stateKey?: string): Promise<StateEvent<T> | undefined>;
    receiveStateEvents<T>(eventType: string, { stateKey, roomIds, }?: {
        stateKey?: string;
        roomIds?: string[] | Symbols.AnyRoom;
    }): Promise<StateEvent<T>[]>;
    requestCapabilities(capabilities: Array<WidgetEventCapability | Capability>): Promise<void>;
    requestOpenIDConnectToken(): Promise<IOpenIDCredentials>;
    rerequestInitialCapabilities(): Promise<void>;
    searchUserDirectory(searchTerm: string, options?: {
        limit?: number | undefined;
    } | undefined): Promise<{
        results: Array<{
            userId: string;
            displayName?: string;
            avatarUrl?: string;
        }>;
    }>;
    sendDelayedRoomEvent<T>(eventType: string, content: T, delay: number, { roomId }?: {
        roomId?: string;
    }): Promise<{
        delay_id: string;
    }>;
    sendDelayedStateEvent<T>(eventType: string, content: T, delay: number, { roomId, stateKey }?: {
        roomId?: string;
        stateKey?: string;
    }): Promise<{
        delay_id: string;
    }>;
    sendRoomEvent<T>(eventType: string, content: T, { roomId }?: {
        roomId?: string;
    }): Promise<RoomEvent<T>>;
    sendStateEvent<T>(eventType: string, content: T, { roomId, stateKey }?: {
        roomId?: string;
        stateKey?: string;
    }): Promise<ISendEventFromWidgetResponseData>;
    sendToDeviceMessage<T>(eventType: string, encrypted: boolean, content: {
        [userId: string]: {
            [deviceId: string | '*']: T;
        };
    }): Promise<void>;
    setModalButtonEnabled(buttonId: ModalButtonID, isEnabled: boolean): Promise<void>;
    updateDelayedEvent(delayId: string, action: UpdateDelayedEventAction): Promise<void>;
    uploadFile(file: XMLHttpRequestBodyInit): Promise<IUploadFileActionFromWidgetResponseData>;
    readonly widgetId: string;
    readonly widgetParameters: WidgetParameters;
}

// @public
export type WidgetApiOptions = {
    capabilities?: Array<WidgetEventCapability | Capability>;
    supportStandalone?: boolean;
};

// @public
export type WidgetApiParameters = {
    widgetId: string;
    clientOrigin: string;
};

// @public
export type WidgetConfig<T extends IWidgetApiRequestData> = Omit<IWidgetApiRequest & IWidget, 'data'> & {
    data: T;
};

// @public
export type WidgetId = {
    mainWidgetId: string;
    roomId?: string;
    creator?: string;
    isModal: boolean;
};

// @public
export enum WidgetParameter {
    // (undocumented)
    AvatarUrl = "avatarUrl",
    // (undocumented)
    BaseUrl = "baseUrl",
    // (undocumented)
    ClientId = "clientId",
    // (undocumented)
    ClientLanguage = "clientLanguage",
    // (undocumented)
    DeviceId = "deviceId",
    // (undocumented)
    DisplayName = "displayName",
    // (undocumented)
    RoomId = "roomId",
    // (undocumented)
    Theme = "theme",
    // (undocumented)
    UserId = "userId"
}

// @public
export type WidgetParameters = {
    userId?: string;
    displayName?: string;
    avatarUrl?: string;
    roomId?: string;
    theme?: string;
    clientId?: string;
    clientLanguage?: string;
    deviceId?: string;
    baseUrl?: string;
    isOpenedByClient: boolean;
};

// @public
export type WidgetRegistration = {
    type?: string;
    name?: string;
    requiredParameters?: WidgetParameter[];
    avatarUrl?: string;
    data?: Record<string, unknown> | {
        title?: string;
    };
};

```
