import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
// @ts-ignore
  export default async function authenticateUser(req, res, next) {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });


      
      if (!session?.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      req.user = session.user;
      next();
    } catch (e) {
      console.error('Auth error:', e);
      res.status(500).json({ error: "Internal auth error" });
    }
  }