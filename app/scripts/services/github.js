'use strict';

app.service('Github', [
    '$rootScope',
    '$q',
    'HybridStorage',
    'Routing',
    'Travis',
    'Scrutinizer',
    'Jenkins',
    'Cleanliness',
    function($rootScope, $q, HybridStorage, Routing, Travis, Scrutinizer, Jenkins, Cleanliness) {
        var config = {
            'routes': {
                'repo': {
                    'url': 'https://api.github.com/repos/::repoName::'
                },
                'orgs': {
                    'url': 'https://api.github.com/orgs/::organizationName::'
                }
            },
        };

        var service = {
            config: config,
            getOrganization: function(organizationName) {
                var url = Routing.proxify(
                    Routing.mapParamsToRoute(this.config.routes.orgs.url, {'organizationName': organizationName})
                );
                return HybridStorage.get(url);
            },
            getRepos: function(organizationName) {
                var deferred = $q.defer();

                this.getOrganization(organizationName).then(function(organization) {
                    HybridStorage.get(Routing.proxify(organization.repos_url)).then(function(repos) {
                        deferred.resolve(repos);
                    });
                });

                return deferred.promise;
            },
            getRepo: function(repoName) {
                var deferred = $q.defer();

                var url = Routing.proxify(Routing.mapParamsToRoute(this.config.routes.repo.url, {'repoName': repoName}));

                HybridStorage.get(url).then(function(repo) {
                    deferred.resolve(repo);
                });

                return deferred.promise;
            },
            getPullRequests: function(repo) {
                var deferred = $q.defer();
                var promises = [];

                promises.push(HybridStorage.get(Routing.proxify(
                    Routing.clean(repo.pulls_url)
                )).then(function(pulls) {
                    var pullPromises = [];

                    for (var pull in pulls) {
                        (function(pull) {
                            var reviewsUrl = Routing.proxify(
                                Routing.clean(pulls[pull].review_comments_url)
                            );
                            pullPromises.push(HybridStorage.get(reviewsUrl).then(function(reviews) {
                                pulls[pull].reviews = reviews;
                            }));
                        })(pull);

                        (function(pull) {
                            var commentsUrl = Routing.proxify(
                                Routing.clean(pulls[pull].comments_url)
                            );
                            pullPromises.push(HybridStorage.get(commentsUrl).then(function(comments) {
                                pulls[pull].comments = comments;
                            }));
                        })(pull);

                        (function(pull) {
                            pullPromises.push(Travis.getPullRequestStatus(repo.full_name, pulls[pull].number).then(function(build) {
                                pulls[pull].travisBuild = build;
                            }));
                        })(pull);

                        (function(pull) {
                            pullPromises.push(Jenkins.getPullRequestStatus(pulls[pull].number).then(function(build) {
                                pulls[pull].behatBuild = build;
                            }));
                        })(pull);
                    }

                    $q.all(pullPromises).then(function() {
                        repo.pulls = pulls;
                    });
                }));
                promises.push(HybridStorage.get(
                    Routing.proxify(Routing.clean(repo.commits_url))
                ).then(function(commits) {
                    repo.commits = commits;
                }));

                $q.all(promises).then(function(){
                    deferred.resolve(repo);
                });

                return deferred.promise;
            },
            getBranches: function(repo) {
                var org = {};
                var deferred = $q.defer();

                HybridStorage.get(repo.branches_url).then(function(branches) {
                    deferred.resolve(branches);
                });

                return deferred.promise;
            },
            getCommitsByRepo: function(repo) {
                var org = {};
                var deferred = $q.defer();

                HybridStorage.get(Routing.proxify(repo.commits_url)).then(function(commits) {
                    deferred.resolve(commits);
                });

                return deferred.promise;
            },
            getTopContributors: function(organizationName) {
                var self = this;
                var deferred = $q.defer();
                var promises = [];
                var contributors = {};
                var topContributors = [];

                this.getRepos(organizationName).then(function(repos) {
                    var lastCommits = [];

                    for (var i = repos.length - 1; i >= 0; i--) {
                        promises.push(self.getCommitsByRepo(repos[i]).then(function(commits) {
                            lastCommits = lastCommits.concat(commits);
                        }));
                    }

                    $q.all(promises).then(function() {
                        var author;

                        for (var i = lastCommits.length - 1; i >= 0; i--) {
                            author = lastCommits[i].author;

                            if (author) {
                                if (typeof contributors[author.login] == 'undefined') {
                                    contributors[author.login] = {'commitCount': 0, 'author': author};
                                } else {
                                    contributors[author.login].commitCount++;
                                }
                            }
                        };

                        for (var i in contributors) {
                            topContributors.push(contributors[i]);
                        };

                        deferred.resolve(topContributors);
                    });
                });

                return deferred.promise;
            }
        };

        return service;
    }
]);