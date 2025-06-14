import { Hono } from "hono";
import file from "./file";

const routes = new Hono()
.route("/file", file)

export default routes;