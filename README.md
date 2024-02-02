# Bug reproduction

In Remix, if you want to ensure full browser compatibility with your `action`s, it's important to always return a redirect. In the event that the client submits a Post prior to hydration and the `action` responds with e.g. a 200, then the Post will persist in browser history and will be re-submitted if the customer clicks the Back button.

However, this poses a problem when you try to implement optimistic UI against an `action` that redirects.

During the resolution of a `useFetcher` submission, there will be at least one re-render where `fetcher.state` is `idle`, `fetcher.formData` is `null`, and `fetcher.data` is `null`. This appears to only occur if an `action` redirects.

Given this behavior, it is not possible to implement optimistic UI against an action without the form submission to that action adding an entry to the browser history.

How to replicate the issue in this repo:

1. Start the dev server and open `localhost:3000`
2. Open the browser debugger
3. Increment the count using the submission buttons until you reach a value, say `3`
4. Place a conditional breakpoint where the `finalCount` value in React must be `3`
5. Increment the value once more
6. Notice that the optimistic UI handling renders the text as `4`, but your breakpoint is paused where `finalCount` is `3`
