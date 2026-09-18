import "./index.css";
import { define } from "../../utils.ts";

// define.handlers 写法：直接返回 { data: xxx }，不要调用 ctx.render()
export const handler = define.handlers({
  async GET(ctx) {
    // 写入state，中间件/页面都可以读取
    ctx.state.title = "关于页面";
		const v=await fetch('https://fresh-app.gh569.deno.net/api/zhangs')
		
    // ✅ define.handlers 约定：返回 { data } 对象，交给页面组件的 props.data
    return {
      data: {
        pageMsg: "来自handler的数据",
				v:JSON.stringify(v)
      }
    };
  },
});

// 页面同时能拿到 state 和 data
export default define.page<typeof handler>(function About({ state, data }) {
  console.log("Shared value " + state.shared);
  return (
    <div>
      about
      <p>state.title: {state.title}</p>
      <p>data.pageMsg: {data.pageMsg}</p>
      <p>data.v: {data.v}</p>
    </div>
  );
});
