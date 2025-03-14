import {
    createRouter,
    createWebHashHistory,
    createWebHistory,
} from "vue-router";
import GameView from "../views/GameView.vue";

const router = createRouter({
    // history: createWebHistory(import.meta.env.BASE_URL),
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            redirect: { path: "/game" },
            children: [
                {
                    path: "/game",
                    name: "game",
                    component: GameView,
                },
            ],
        },
        {
            path: "/about",
            name: "about",
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import("../views/AboutView.vue"),
        },
    ],
});

export default router;
