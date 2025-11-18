# Debug Guide: Switch Controls Not Working

## Issue Description
The switch controls for `isActive`, `emailVerified`, and `phoneVerified` in the user edit form always appear as false, even when their values should be true.

## Changes Made for Debugging

### 1. Removed Static defaultValue Properties
**File**: `pages/users/[id]/edit.vue`

Removed the `defaultValue` properties from the switch field configurations (lines 120, 127, 134) because they were potentially conflicting with the dynamic `initialValues` loaded from the API.

**Before**:
```typescript
{
  name: 'isActive',
  label: 'Usuario Activo',
  type: 'switch',
  defaultValue: true, // ❌ Removed
  description: 'Habilitar o deshabilitar el acceso del usuario',
}
```

**After**:
```typescript
{
  name: 'isActive',
  label: 'Usuario Activo',
  type: 'switch',
  description: 'Habilitar o deshabilitar el acceso del usuario',
}
```

### 2. Added Comprehensive Debug Logging

#### A. User Edit Page (`pages/users/[id]/edit.vue`)
- **On mount**: Logs the loaded user data and initial values set
- **On submit**: Logs form values, data being sent, and response received

#### B. Users Composable (`modules/users/composables/useUsers.ts`)
- **updateUser function**: Logs data being sent and response received from API

#### C. API Route (`server/api/users/[id].put.ts`)
- **Request**: Logs body received from frontend
- **Response**: Logs backend response before returning

#### D. DynamicForm Component (`components/shared/DynamicForm/DynamicForm.vue`)
- **getInitialValues**: Logs how initial values are being created

## How to Debug

### Step 1: Open Browser DevTools Console

### Step 2: Navigate to User Edit Page
Go to `/users/[id]/edit` for any user.

### Step 3: Check Console Logs in Order

Look for these logs in sequence:

1. **📥 User data loaded:**
   ```
   📥 User data loaded: { isActive: true, emailVerified: false, phoneVerified: false }
   ```
   This shows what the API returned.

2. **📝 Initial values set:**
   ```
   📝 Initial values set: { isActive: true, emailVerified: false, phoneVerified: false }
   ```
   This shows what was set in the `initialValues` ref.

3. **🔨 DynamicForm - getInitialValues:**
   ```
   🔨 DynamicForm - getInitialValues: { hasInitialValues: true, isActive: true, emailVerified: false, phoneVerified: false }
   ```
   This shows what the DynamicForm component used to initialize the form.

   **KEY CHECK**: If `hasInitialValues` is `false`, it means the component mounted before the data loaded!

### Step 4: Change Switch Values and Submit

Toggle the switches and click "Actualizar Usuario". Watch for:

4. **📤 Form values submitted:**
   ```
   📤 Form values submitted: { isActive: true, emailVerified: true, phoneVerified: false }
   ```
   This shows what values the form collected when submitted.

5. **📦 Data being sent to API:**
   ```
   📦 Data being sent to API: { isActive: true, emailVerified: true, phoneVerified: false }
   ```
   This shows the data after processing (password removed if empty).

6. **🔧 useUsers.updateUser - Data to send:**
   ```
   🔧 useUsers.updateUser - Data to send: { isActive: true, emailVerified: true, phoneVerified: false }
   ```
   This shows what the composable is sending.

7. **🌐 API Route - Body received:**
   ```
   🌐 API Route - Body received: { isActive: true, emailVerified: true, phoneVerified: false }
   ```
   This shows what the Nuxt server received.

8. **🌐 API Route - Backend response:**
   ```
   🌐 API Route - Backend response: { success: true, isActive: true, emailVerified: true, phoneVerified: false }
   ```
   This shows what the NestJS backend returned.

9. **🔧 useUsers.updateUser - Response:**
   ```
   🔧 useUsers.updateUser - Response: { success: true, isActive: true, emailVerified: true, phoneVerified: false }
   ```
   This shows what the composable received back.

10. **✅ Updated user received:**
    ```
    ✅ Updated user received: { isActive: true, emailVerified: true, phoneVerified: false }
    ```
    This shows the final updated user object.

## Possible Issues and Solutions

### Issue 1: hasInitialValues is false
**Symptom**: Log #3 shows `hasInitialValues: false`

**Cause**: The DynamicForm component mounted before the async data finished loading.

**Solution**: The `v-if="currentUser"` condition on the DynamicForm should prevent this. If it still happens, there might be a timing issue.

### Issue 2: Values Change Between Logs
**Symptom**: Log #4 shows different values than what you set in the UI.

**Cause**: The form isn't correctly binding to the switch components.

**Solution**: Check the Switch component binding in DynamicForm.vue (line 209-210).

### Issue 3: Backend Returns Different Values
**Symptom**: Log #8 shows different values than log #7.

**Cause**: The backend might be ignoring or overwriting the values.

**Solution**: Check the backend service method `updateUserAdmin` in `users.service.ts`.

### Issue 4: Switches Don't Reflect True Values
**Symptom**: Logs show correct values, but switches still appear false in UI.

**Cause**: The switch component isn't reactive to the model value.

**Solution**: Check the key prop on DynamicForm - it should force re-render when values change:
```vue
:key="`${userId}-${currentUser.isActive}-${currentUser.emailVerified}-${currentUser.phoneVerified}`"
```

## Backend Verification

If the frontend logs all look correct but switches still don't work, check the backend:

### Check Users Service
File: `src/modules/users/services/users.service.ts`

Look for the `updateUserAdmin` method and verify it's actually saving the boolean fields:

```typescript
async updateUserAdmin(id: string, updateDto: UpdateUserAdminDto): Promise<User> {
  // Make sure it's not overwriting isActive, emailVerified, phoneVerified
}
```

### Check Database
Connect to PostgreSQL and verify the values are actually being saved:

```sql
SELECT id, email, "isActive", "emailVerified", "phoneVerified"
FROM users
WHERE id = 'user-id-here';
```

## Clean Up

Once the issue is resolved, you can optionally remove all the `console.log` statements added for debugging. Search for these emojis in the codebase:

- 📥 📝 📤 📦 ✅ (in `pages/users/[id]/edit.vue`)
- 🔧 (in `modules/users/composables/useUsers.ts`)
- 🌐 (in `server/api/users/[id].put.ts`)
- 🔨 (in `components/shared/DynamicForm/DynamicForm.vue`)

## Next Steps

1. Test the form with the debugging enabled
2. Review the console logs to identify where the values are being lost or changed
3. Apply the appropriate solution based on the findings
4. Report back what you find in the logs
