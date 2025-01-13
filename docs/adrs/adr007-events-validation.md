# ADR007: Data Validation

Status: accepted

<!-- These documents have names that are short noun phrases. For example, "ADR001: Deployment on Ruby on Rails 3.0.10" or "ADR009: LDAP for Multitenant Integration" -->

## Context

<!--
This section describes the forces at play, including technological, political, social, and project local. These forces are probably in tension, and should be called out as such. The language in this section is value-neutral. It is simply describing facts. -->

Widgets can use Matrix events that are defined in the Matrix specification, as well as custom events that might be
created and used by other custom Matrix clients or widgets.

The Matrix specification states that events should be considered as untrusted data. This applies both to Matrix and
custom events.

[MSC2801][msc2801] provides reasons why events may not match the specification and the conclusion that
clients must treat all event data as untrusted.

Matrix events are described by the Matrix specification with [event schemas][eventSchemas]. This should be used as
a reference to implement validation logic of the events used.

Widgets may also load data from other data sources: localstorage, RTC channel, HTTP APIs. In general,
we could not assume these events and data to be valid all the time and therefore must validate them.

## Decision

<!-- This section describes our response to these forces. It is stated in full sentences, with active voice. "We will ..." -->

We validate all events and data that is received by widgets from different sources:

For Matrix events (both from the Matrix specification and custom widget events):

- `type` has expected event type, example: `m.room.name`, `net.nordeck.whiteboard`
- `content` to be an `object` and to be defined
- `content` is validated to match the schema

For events and data from other data sources: we apply validation of data to match the schema.

Schema based validation includes:

- required fields are listed
- optional and required fields values have the expected data types
- field's primitive values match expected grammar: dates in ISO 8601, MXC URIs, whitelist values
- field's object data is also validated according to schema

We use several ways to validate incoming data.

### Plain code

We write validation logic in plain code when it is not complicated or we don't want to use a library, introducing another external dependency.

[Example][examplePlainRelatesTo] that validates that event has [`m.relates_to` object][matrixEventsRelations] in the content:

<!--prettier-ignore-->
   ```ts
    // ....

    /**
     * Validates that `event` has a valid structure for a
     * {@link EventWithRelatesTo}.
     * @param event - The event to validate.
     * @returns True, if the event is valid.
     */
    export function isValidEventWithRelatesTo(
      event: RoomEvent,
    ): event is EventWithRelatesTo<string> {
      if (!event.content || typeof event.content !== 'object') {
        return false;
      }
    
      const relatedEvent = event as EventWithRelatesTo<string>;
    
      if (
        !relatedEvent.content['m.relates_to'] ||
        typeof relatedEvent.content['m.relates_to'] !== 'object'
      ) {
        return false;
      }
    
      if (
        typeof relatedEvent.content['m.relates_to'].rel_type !== 'string' ||
        typeof relatedEvent.content['m.relates_to'].event_id !== 'string'
      ) {
        return false;
      }
    
      return true;
    }
   ```

### Joi

We prefer to use [Joi][joi] when we need to validate data with more complex structure. Joi provides powerful
validation features.

[Example][exampleJoiReaction] that validates the content of `m.reaction.event`:

<!--prettier-ignore-->
   ```ts
    export type ReactionEvent = {
      'm.relates_to': {
        rel_type: string;
        event_id: string;
        key: string;
      };
    };
    
    const reactionEventSchema = Joi.object<ReactionEvent, true>({
      'm.relates_to': Joi.object({
        rel_type: Joi.string().required(),
        event_id: Joi.string().required(),
        key: Joi.string().required(),
      })
        .unknown()
        .required(),
    }).unknown();

    reactionEventSchema.validate(eventContent);
   ```

## Consequences

<!-- This section describes the resulting context, after applying the decision. All consequences should be listed here, not just the "positive" ones. A particular decision may have positive, negative, and neutral consequences, but all of them affect the team and project in the future. -->

We apply validation to all incoming Matrix events according to schemas and filter out invalid events. We also
validate all other data that comes from non-Matrix data sources.

The Matrix Widget Toolkit `api` package provides [validators][toolkitApiExtras]
for some Matrix events to be used in widget implementations.

The Matrix Widget Toolkit `example-widget-mui` provides several [examples][toolkitExampleWidgetEvents] how to implement validators using Joi.

<!-- This template is taken from a blog post by Michael Nygard http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions -->

[msc2801]: https://github.com/matrix-org/matrix-spec-proposals/pull/2801
[eventSchemas]: https://github.com/matrix-org/matrix-spec/tree/main/data/event-schemas/schema
[strippedState]: https://spec.matrix.org/v1.13/client-server-api/#stripped-state
[examplePlainRelatesTo]: https://github.com/nordeck/matrix-widget-toolkit/blob/20d3c085c65ed063577b4b318aefb4b1610e3d8b/packages/api/src/api/extras/relatesTo.ts#L91-L121
[exampleJoiReaction]: https://github.com/nordeck/matrix-widget-toolkit/blob/20d3c085c65ed063577b4b318aefb4b1610e3d8b/example-widget-mui/src/events/reactionEvent.ts#L26-L55
[joi]: https://joi.dev/
[toolkitApiExtras]: https://github.com/nordeck/matrix-widget-toolkit/tree/main/packages/api/src/api/extras
[toolkitExampleWidgetEvents]: https://github.com/nordeck/matrix-widget-toolkit/tree/main/example-widget-mui/src/events
[matrixEventsRelations]: https://spec.matrix.org/v1.13/client-server-api/#forming-relationships-between-events
