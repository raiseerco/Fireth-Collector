let config_data = null
module.exports = function () {
    if (config_data != null && config_data != undefined) {
        return config_data
    }
    config_data = {}
    //LOAD JSON
    config_data = require('./config/config.production.json')
    return config_data
}