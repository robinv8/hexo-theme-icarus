(function () {
    var APP_ID = 'u2gJTcuqavSwCdEsRwQE0tjd-gzGzoHsz';
    var APP_KEY = 'sVNL8thqtOPCvv0nNxUrFvX6';
    var SITE_VIEWS_TITLE = 'robinblog';
    var HOST = 'rnode.me';
    var leancloudService = {
        url: window.location.href,
        title: $('.article-title').text().trim(),
        Counter: null,
        init: function () {
            AV.init(APP_ID, APP_KEY);
            this.Counter = AV.Object.extend('Counter');
            if (this.isDetail()) {
                this.addDetailCount(this.Counter, this.url, this.title, this.detailCountSaveCallback);
            } else {
                this.addExceptDedtailCount(this.Counter, this.siteCountSaveCallback);
            }
        },
        /**
         * 获取文章详情访问数
         */
        getDetailCount: function (Counter) {
            var query = new AV.Query(Counter);
            query.equalTo("url", this.url);
            return query.find();
        },

        /**
         * 获取 site 访问数
         */
        getSiteCount: function (Counter) {
            var query = new AV.Query(Counter);
            query.equalTo("title", SITE_VIEWS_TITLE);
            return query.find();
        },

        /**
         * 增加文章详情页面访问数
         */
        addDetailCount: function (Counter, url, title, cb) {
            // site views increment
            this.addExceptDedtailCount(Counter, this.siteCountSaveCallback);
            this.getDetailCount(Counter)
                .then(function (results) {
                    var len = results.length;
                    if (len > 0) {
                        $('.leancloud_visitors').text(results[0]._serverData.time + '人已浏览');
                        var counter = results[0];
                        counter.increment("time");
                        counter.save({
                            fetchWhenSave: true,
                        }).then(cb);
                    }
                    else {
                        var newCounter = new Counter();
                        newCounter.set('title', title);
                        newCounter.set('url', url);
                        newCounter.set('time', 1);
                        newCounter.save().then(cb, function (error) {
                            console.error(error);
                        })
                    }
                })
        },
        /**
         * 统计非详情页的访问，主要是首页、列表页，归档页，关于，category，tag页面
         */
        addExceptDedtailCount: function (Counter, cb) {
            this.getSiteCount(Counter)
                .then(function (results) {
                    if (results.length > 0) {
                        var counter = results[0];
                        counter.increment("time");
                        counter.save({
                            fetchWhenSave: true,
                        }).then(cb);
                    }
                    else {
                        var newCounter = new Counter();
                        newCounter.set('title', SITE_VIEWS_TITLE);
                        newCounter.set('url', HOST);
                        newCounter.set('time', 1);
                        newCounter.save().then(cb, function (error) {
                            console.error(error);
                        })
                    }
                })
        },
        /**
         * 判断是否是文章详情页面
         */
        isDetail: function () {
            var $title = $('.post-detail');
            return $title.length == 1
        },

        /**
         * 详情页保存成功回调
         */
        detailCountSaveCallback: function (counter) {
            $('#leancloud_value_page_pv').text(counter.attributes.time);
        },

        siteCountSaveCallback: function (counter) {
            $('#site-view').text(counter.attributes.time);
        }
    };

    leancloudService.init();
})()