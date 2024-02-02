import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
  type MetaFunction,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import countCookie from "../countCookie.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const currentCount = await countCookie.parse(request.headers.get("Cookie"));

  return json({ count: currentCount ?? 0 });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const currentValue = parseInt(formData.get("currentValue"));
  const intent = formData.get("intent");

  const newValue = intent === "increment" ? currentValue + 1 : currentValue - 1;

  return json(
    { newValue },
    {
      headers: {
        "Set-Cookie": await countCookie.serialize(newValue),
        Location: "/",
      },
      status: 302,
    }
  );
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const loaderCount = loaderData.count;
  let optimisticCount = null;
  if (fetcher.formData) {
    const intent = fetcher.formData.get("intent");
    const currentValue = parseInt(fetcher.formData.get("currentValue"));
    optimisticCount =
      intent === "increment" ? currentValue + 1 : currentValue - 1;
  } else if (fetcher.data) {
    optimisticCount = fetcher.data.newValue;
  }

  const finalCount = optimisticCount ?? loaderCount;

  return (
    <div
      style={{
        color: finalCount % 2 === 0 ? "blue" : "red",
        fontSize: "2rem",
      }}
    >
      <h1>Remix redirect-after-you-post</h1>
      <p>
        The text color of this page will change to blue if the count value is
        even and red if it&apos;s odd. Count is {finalCount}
      </p>
      <fetcher.Form method="post">
        <input type="hidden" name="currentValue" value={finalCount} />
        <button name="intent" value="decrement" type="submit">
          Decrement
        </button>
        <button name="intent" value="increment" type="submit">
          Increment
        </button>
      </fetcher.Form>
    </div>
  );
}
