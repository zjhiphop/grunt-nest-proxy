var iniparser = require('iniparser');
var fs = require('fs');
var home_dir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
var config_file = home_dir + '/.gitconfig';
var exists = fs.existsSync(config_file);

module.exports = {
    get: function(key) {
        if (!exists) {
            console.log("The global git config file not exists, please check~");

            return;
        }

        var config = exists ? iniparser.parseSync(config_file) : {};
        var keys = key.replace(/\{\{git-(.*?)-config\}\}/, function($, $$) {
            return $$;
        }).split('.').reverse();

        var k;

        while (keys.length) {
            while (!(k = keys.pop()));

            config = config[k];
        }

        return config;
    },

    checkAndReplaceGitConfig: function(target) {
        if (target.indexOf("git") === -1) {
            return target;
        }

        var me = this;

        return target.replace(/\{\{(.*?)\}\}/g, function($, $$) {

            var k = $$.replace(/git-(.*?)-config/g, function($, $1) {
                return $1;
            });

            return me.get(k);
        });
    },

    // Convert "XXXX-XXX" like param to "XXXX_XXX" for oauth request
    renameOAuthKey: function(section) {
        if (!section) return;

        var result = {};

        Object.keys(section).forEach(function(k) {
            result[k.replace('-', '_')] = section[k];
        });

        return result;
    }
}