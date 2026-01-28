# Real-time Sync Testing Guide

## ✅ چیزیں جو Fix ہوئیں

1. **Event Bus بہتری** - اب detailed logs دکھاتا ہے
2. **useTasks Hook** - اب userId پر depend کرتا ہے نہ کہ fetchTasks پر
3. **ChatInterface** - 100ms delay add کیا تاکہ backend پہلے complete ہو
4. **Visual Indicator** - Dashboard میں "refreshing..." دکھتا ہے جب tasks load ہو رہے ہوں

## 🧪 کیسے Test کریں

### Step 1: Dashboard کھولیں
```
http://localhost:3000/dashboard
```

### Step 2: Browser Console کھولیں (F12)
- آپ کو یہ logs دکھنی چاہیں:
```
🎧 useTasks: Setting up event listener for TASKS_REFRESH
```

### Step 3: AI Assistant (Chat) پر Click کریں

### Step 4: Task بنائیں
```
Create a task called "test task" with high priority
```

### Step 5: Console میں یہ Logs دیکھیں
```
🔧 Tool calls detected: ['add_task']
📤 Emitting TASKS_REFRESH event...
✅ Event emitted!
🎯 EventBus: Emitting 'task:refresh' to 1 listener(s)
📢 useTasks: Received TASKS_REFRESH event, refetching tasks...
✅ useTasks: Successfully fetched X tasks
```

### Step 6: Tasks View پر واپس جائیں
- نیا task فوراً نظر آنا چاہیے
- "refreshing..." indicator کچھ سیکنڈ کے لیے دکھے گا

## 🐛 اگر کام نہ کرے تو

### Console میں یہ check کریں:

1. **کیا event listener setup ہوا؟**
   - دیکھیں: `🎧 useTasks: Setting up event listener`

2. **کیا tool calls detect ہوئے؟**
   - دیکھیں: `🔧 Tool calls detected: ['add_task']`

3. **کیا event emit ہوا؟**
   - دیکھیں: `📤 Emitting TASKS_REFRESH event...`
   - دیکھیں: `🎯 EventBus: Emitting 'task:refresh' to X listener(s)`

4. **کیا event receive ہوا؟**
   - دیکھیں: `📢 useTasks: Received TASKS_REFRESH event`

### Common Issues:

❌ **"No listeners for event 'task:refresh'"**
- Solution: Dashboard component mount نہیں ہوا - page reload کریں

❌ **"Cannot refresh - no userId"**
- Solution: Authentication issue - sign in again

❌ **Event emit ہوا لیکن receive نہیں**
- Solution: Components different trees میں ہیں - check ChatProvider wrapping

## 📊 Expected Behavior

✅ Chat میں task create کریں
✅ Console میں logs دکھیں
✅ Tasks view میں "refreshing..." indicator دکھے
✅ New task بغیر manual refresh کے دکھے

## 🔍 Debugging Commands

Browser console میں یہ run کریں:

```javascript
// Check how many listeners are registered
window._eventBusDebug = eventBus;

// Manually trigger refresh
eventBus.emit('task:refresh');

// Check listener count
console.log(eventBus.events);
```

---

## 📝 Changes Made

1. **eventBus.ts** - Added detailed logging for emit/subscribe
2. **useTasks.ts** - Fixed dependency array, inline refresh handler
3. **ChatInterface.tsx** - Added 100ms delay, better tool detection
4. **Dashboard.tsx** - Visual "refreshing..." indicator
