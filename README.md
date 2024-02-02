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

This repo has three reproduction commits:

- commit 7c06980182ac56c38e7d2128235f6df9f1760f2f
  - reproduction: returning action data as a redirect re-introduces the variance in optimistic data
  - In this commit, the `action` is returning data and responding with a redirect. The absence of data on `fetcher` can be reproduced here as in 28d6ee352a09798ad10c6f8e12b1edcdb8f5a050
- commit 332b31c19e8172c1fd92aab1140945c7be01da45
  - reproduction: data from useFetcher never flickers if data is returned from action without a redirect
  - In this commit, the flicking bug cannot be reproduced because the `action` is not returning a redirect. However. if you disable JavaScript, submit the form, then click the Back button, the browser will re-submit your Post request.
- commit 750f2de88a1ffea4f53dd2fc7c670672b3a893d4
  - reproduction: fetcher is idle without formData
  - In this commit, the absence of data on `fetcher` can be reproduced. `action` redirects without returning data.
