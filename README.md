# A comprehensive demo of Optimistic Updates in TanStack Query
[Link to TanStack Query v5 Optimistic Updates Documentation](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

## **Pessimistic vs Optimistic Updates in TanStack Query:**

**Pessimistic Updates** wait for the server to confirm success before updating the UI - you click submit, see a loading state, then the UI updates only after the server responds. **Optimistic Updates** immediately update the UI assuming success, then handle the server response in the background - you click submit and instantly see the change, with automatic rollback if the server request fails. 

The key difference is **when the UI updates**: pessimistic updates show changes **after** server confirmation (slower but safer), while optimistic updates show changes **before** server confirmation (faster but requires rollback logic). Optimistic updates provide a much more responsive user experience since users see immediate feedback, but require more complex error handling to revert changes when requests fail.

**In practice**: Pessimistic feels like "wait and see" while Optimistic feels like "assume success, fix if wrong" - making apps feel significantly faster and more responsive to users.

## **The Ethical Question:**

Some argue this creates **false expectations** about system performance, while others say it's simply **good UX design** that matches user mental models. The key is handling the "illusion breaking" moments (errors) gracefully so users don't feel deceived.

The illusion works best when failures are rare - which is why optimistic updates are perfect for high-reliability operations like adding products, liking posts in social media, or sending messages.

## The companion YouTube video tutorial with this repo is located here:
[Link to YouTube Video](https://youtu.be/LhTxERrTWPM?si=oFNOeMfXh0ICoPJb)

