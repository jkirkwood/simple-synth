# simple-synth

This is a simple web based synthesizer powered by the Web Audio API. Includes
basic synth staples such as filter and volume envelope controls, as well as
collaboration via websockets.

## Installation

Clone this repo form Github and run:

```
npm install
```

## Launch

To launch the app run:

```
npm start
```

The app should now be available at `http://localhost:3000` in your browser.

## Rooms

By default, when clients connect to the server they will be redirected to a
randomly generated path representing a "room". If another client connects to
to the same URL all notes played and setting changes will be synced with all
other clients in the room.

