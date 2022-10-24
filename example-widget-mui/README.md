# Matrix Example Widget (Material UI)

This is an example that shows how you can write a Matrix/Element widget.
You can use this package as a starting point for writing new widgets.

![](./docs/widget-overview.png)

The widget demonstrates:

- How to receive and send room events ([`DicePage`](./src/DicePage/DicePage.tsx)).
- How to receive and send state events ([`RoomPage`](./src/RoomPage/RoomPage.tsx)).
- How to use Redux for state management ([`PowerLevelsPage`](./src/PowerLevelsPage/PowerLevelsPage.tsx)).
- How to read data from all rooms ([`AllRoomsPage`](./src/AllRoomsPage/AllRoomsPage.tsx)).
- How to open widget modals ([`Modal`](./src/ModalPage/ModalPage.tsx)).
- How to use the UI components so the widget match the style of Element ([`Theme`](./src/ThemePage/ThemePage.tsx)).
- And other examples…

## Getting started

Run `HTTPS=true yarn start` to start the example app.

To test the widget locally visit `http://localhost:3000` and follow the instructions on the page.
This will only work in a Chrome instance that is started with `--allow-insecure-localhost --disable-site-isolation-trials --disable-web-security` flags.

> **Warning** Do not use this Chrome instance to browse the web!

Alternatively, you can start a local element version that runs without `https://` or use tunneling services such as [`localtunnel`](https://github.com/localtunnel/localtunnel) to avoid mixed-content errors.
