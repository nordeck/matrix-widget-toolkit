---
'@matrix-widget-toolkit/api': major
'@matrix-widget-toolkit/testing': major
---

Rework powerlevel calculations to comply with spec in all room versions.

Note this now requires the create room event to be passed to the power level functions.
Additionally, the mock widget api now has changed user id and room id defaults to comply with matrix spec.
