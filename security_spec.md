# Security Specification - StayEase

## Data Invariants
1. A Room cannot have occupancy greater than its capacity.
2. A Resident can only view their own Payments and Complaints.
3. An Allocation must reference an existing User and an existing Room.
4. Only Admins can modify Room parameters and post Notices.
5. Users cannot elevate their own roles to 'admin'.

## The Dirty Dozen Payloads (Rejection Targets)
1. **Role Escalation**: Resident trying to set `role: 'admin'` on creation.
2. **Shadow Field**: Adding `isVerified: true` to a Room update.
3. **Identity Spoofing**: Resident creating a Complaint with another user's `userId`.
4. **Invalid Room Capacity**: Setting room capacity to -5.
5. **PII Leak**: Unauthorized user trying to `get()` another user's profile.
6. **Payment Forgery**: Resident marking their own payment as `status: 'Paid'` (if logic requires Admin verification).
7. **Notice Injection**: Resident trying to `create` a Notice.
8. **Allocation Overwrite**: Resident trying to `delete` or `update` an Allocation record.
9. **Junk ID**: Using a 2KB string as a Document ID.
10. **State Shortcut**: Resident trying to move a complaint directly from `Pending` to `Resolved`.
11. **Orphaned Allocation**: Creating an allocation for a non-existent room.
12. **Future Payment**: Creating a payment for the year 2099.

## The Test Runner Plan
We will use `@firebase/rules-unit-testing` logic (conceptually in `firestore.rules.test.ts`) to ensure these are blocked.
