#!/bin/bash

USER_ID="02dc39dc-c383-4cde-ba65-71b4b7f21e60"

echo "=================================================="
echo "🧪 TESTING ALL API ENDPOINTS"
echo "=================================================="
echo ""

echo "1️⃣  POST - Create a new task"
echo "--------------------------------------------------"
curl -s -X POST "http://localhost:8000/api/${USER_ID}/tasks" \
  -H "Authorization: Bearer mock-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test Task",
    "description": "Created via API test",
    "priority": "medium",
    "category": "testing"
  }' | python3 -m json.tool
echo ""

echo "2️⃣  GET - List all tasks"
echo "--------------------------------------------------"
curl -s "http://localhost:8000/api/${USER_ID}/tasks" \
  -H "Authorization: Bearer mock-token" | python3 -c "import sys,json; tasks=json.load(sys.stdin); print(f'✅ Found {len(tasks)} tasks:'); [print(f'   - Task {t[\"id\"]}: {t[\"title\"]} ({t[\"status\"]})') for t in tasks]"
echo ""

echo "3️⃣  GET - Get specific task #2"
echo "--------------------------------------------------"
curl -s "http://localhost:8000/api/${USER_ID}/tasks/2" \
  -H "Authorization: Bearer mock-token" | python3 -c "import sys,json; t=json.load(sys.stdin); print(f'✅ Task: {t.get(\"title\", \"N/A\")}, Status: {t.get(\"status\", \"N/A\")}')"
echo ""

echo "4️⃣  PUT - Update task #2"
echo "--------------------------------------------------"
curl -s -X PUT "http://localhost:8000/api/${USER_ID}/tasks/2" \
  -H "Authorization: Bearer mock-token" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated API Test Task", "priority": "high"}' | python3 -c "import sys,json; t=json.load(sys.stdin); print(f'✅ Updated: {t.get(\"title\", \"N/A\")}, Priority: {t.get(\"priority\", \"N/A\")}')"
echo ""

echo "5️⃣  PATCH - Toggle completion of task #2"
echo "--------------------------------------------------"
curl -s -X PATCH "http://localhost:8000/api/${USER_ID}/tasks/2/complete" \
  -H "Authorization: Bearer mock-token" | python3 -c "import sys,json; t=json.load(sys.stdin); print(f'✅ Status: {t.get(\"status\", \"N/A\")}, Completed: {t.get(\"completed_at\", \"Not yet\")}')"
echo ""

echo "6️⃣  DELETE - Delete task #2"
echo "--------------------------------------------------"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "http://localhost:8000/api/${USER_ID}/tasks/2" -H "Authorization: Bearer mock-token")
if [ "$STATUS" = "204" ]; then
    echo "✅ Task deleted successfully (HTTP 204)"
else
    echo "❌ Delete failed (HTTP $STATUS)"
fi
echo ""

echo "7️⃣  Final - List remaining tasks"
echo "--------------------------------------------------"
curl -s "http://localhost:8000/api/${USER_ID}/tasks" \
  -H "Authorization: Bearer mock-token" | python3 -c "import sys,json; tasks=json.load(sys.stdin); print(f'✅ Remaining tasks: {len(tasks)}'); [print(f'   - Task {t[\"id\"]}: {t[\"title\"]}') for t in tasks]"
echo ""

echo "=================================================="
echo "✅ ALL TESTS COMPLETED"
echo "=================================================="
