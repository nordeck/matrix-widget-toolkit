---
'@matrix-widget-toolkit/api': patch
'@matrix-widget-toolkit/testing': patch
---

Support the `direction` option when reading event relations.

This also changes the default behavior of the `MockWidgetApi` that returned the events in the wrong order when no direction is provided.
