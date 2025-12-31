import { useSignal } from "@preact/signals";
import Check from "../islands/check/Check.jsx";

export default function Home() {
  const count = useSignal(3);
  return (
	<html>
		<head>
			<title>My App</title>
			<link rel="stylesheet" href="./css/check.css" />
		</head>
		<body>
		<div >
		    <Check /><
		</div>
		</body>
    </html>
  );
}
