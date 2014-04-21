app.service('Config', [
    '$rootScope',
    'LocalStorage',
    function($rootScope, LocalStorage) {
        var service = {
            isInitialized: function() {
                return null === LocalStorage.get('config');
            },
            isValid: function() {
                return null !== LocalStorage.get('config') &&
                    '' != LocalStorage.get('config').organizationName &&
                    '' != LocalStorage.get('config').repoName &&
                    '' != LocalStorage.get('config').jiraProjectName &&
                    '' != LocalStorage.get('config').jiraProjectVersion;
            },
            initialize: function() {
                LocalStorage.set('config', {
                    'organizationName': '',
                    'repoName': '',
                    'jiraProjectName': '',
                    'jiraProjectVersion': ''
                });
            },
            getConfig: function(resource) {
                var config = LocalStorage.get('config');

                if (config == null) {
                    config = {};
                }

                if (config[resource] == null) {
                    config[resource] = '';
                }

                LocalStorage.set('config', config);

                return config[resource];
            },
            setConfig: function(resource, value) {
                var config = LocalStorage.get('config');

                if (config == null) {
                    config = {};
                }

                config[resource] = value;
                LocalStorage.set('config', config);
            },
            showConfigModal: function() {
                $rootScope.$emit('configuration.show');
            }
        };

        return service;
    }
]);