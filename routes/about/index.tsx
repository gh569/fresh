import "./index.css";
import { define } from "../../utils.ts";
import Test from '../../islands/test/Test.jsx'

export const handler = define.handlers({
  // GET 加上 async
  async GET(ctx) {
    // 1. fetch 请求远程接口
    // const res = await fetch("https://jsonplaceholder.typicode.com/posts/1");
    const res = await fetch("https://env-00jxhocqgh3m-static.normal.cloudstatic.cn/a.json");
    const apiData = await res.json();
		// const value=JSON.parse(apiData)

    // 2. 写入state（可选，用于中间件共享）
    ctx.state.title = "关于页面";

    // 3. 返回 { data }，data 会自动传给页面组件 props.data
    return {
      data: {
        api: apiData
      }
    };
  },
});

// 页面组件接收 data 和 state
export default define.page<typeof handler>(function About({ state, data }) {
  return (
    <div>
      <h1>about</h1>
      <p>state.title：{state.title}</p>
      <h3>远程接口数据</h3>
      <p>姓名：{data.api.name}</p>
      <p>年龄：{data.api.age}</p>
			<Test value={data.api} />
			<p>{JSON.stringify(data.api)}</p>
    </div>
  );
});
