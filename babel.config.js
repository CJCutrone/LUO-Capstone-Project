/**
 * @author Camille Cutrone
 */
module.exports =  function (api) {
    api.cache(true);
    return {
        presets: [
            [
                "@babel/env"
            ],
            [
                "minify"
            ]
        ]
    }
};