# RADIATRON X-9 DRS - SENDER DASHBOARD

## 📱 WhatsApp-Style Message Sender

This is the Sender dashboard for the RADIATRON X-9 DRS system. It provides a WhatsApp-style interface for sending messages that will be displayed on the Receiver dashboard.

## Features
- WhatsApp-style chat interface
- Send messages with timestamps
- Delete messages (syncs with Firebase)
- Real-time sync with Receiver dashboard
- Green message bubbles with proper styling

## Installation

1. **Install Dependencies:**
```bash
npm install
```

2. **Start Development Server:**
```bash
npm start
```
The app will open at http://localhost:3000

3. **Build for Production:**
```bash
npm run build
```
The build folder will contain all production files.

## Deployment

### For Web Hosting:
1. Run `npm run build`
2. Upload the contents of the `build` folder to your web server
3. Access via browser

### For Desktop/Tablet:
- Open in any modern browser
- Works on all devices with internet connection

## Usage
1. Type your message in the input field
2. Press Enter or click Send button
3. Messages appear instantly with timestamp
4. Click Delete to remove any message
5. All changes sync with Receiver in real-time

## Firebase Configuration
The app is pre-configured with Firebase. Messages are stored at:
```
/radiatron/messages
```

## Notes
- Messages persist in Firebase until deleted
- All timestamps are in local time
- Deleted messages are removed from both Sender and Receiver
