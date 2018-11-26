/**
 * @author Camille Cutrone
 */
module.exports = {
    __dirname,
    logoutPage: (req, resp) =>{
        req.logout();
        resp.redirect("/");
    },
    loginPage: (_, resp) => resp.render("login", { title: "Alliance Ministries: Managment - Login" }),
    applicationPage: (_, resp) => resp.render("application", { title: "Alliance Ministries: Managment" })
};