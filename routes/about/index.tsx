import "./index.css";
import { define } from "../../utils.ts";

// export const handler = define.handlers({
//   GET(ctx) {
//     const name = ctx.params.name;
//     return new Response(
//       `Hello, ${name.charAt(0).toUpperCase() + name.slice(1)}!`,
//     );
//   },
// });


export default define.page(function About(ctx) {

  console.log("Shared value " + ctx.state.shared);

  return (
    <div >
      about
      
    </div>
  );
});

