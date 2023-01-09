# Thoughts

## Architecture

- Layers:
  - Whiteboard layer (business logic with automerge documents)
    - returns state
    - has modification operations
    - model as hook, or as CLASS?
    - one per whiteboard? maybe even one per slide?
  - Persistance Layer
    - Store as matrix events
  - Real-Time Communication Layer
    - Start with local Broadcast channel
    - later webrtc

## CRDTs

- how to model data
- how to model ordering, mabye as now
- doc per slide?
- doc for whiteboard and slides array itself
- duplicate slides to fix doc size?

## Communication

- Element Call would be nice, but to unstable!
- start without realtime layer, or with a very simple boardcast channel one?


## Persistence

- Split data and store using base64
    - how to split correctly? we don't know the max content size. we also need 
    - to split before base64?
    - how to relate snapshots?
    - snapshot chunks?
        - reading from back to front? Use sequence numbers to check whether all were read?
        - count is required too!
- later we could even go for a file based storage?


# Next Steps

- start with just the data model:
  - whiteboard state event
  - whiteboard / slide data, if we use a 

- crdt doc start / or just an initial snapshot?
    - snapshots referencing it

- Get device id useable (backward compatible?)
    - Send to device messages between peers? Or can we even go without device id for the start?
- Create a schema similar to element call for "present" users, announcing their devices/sessions
    - How to cleanup?
    - How to update?
- 