module.exports = {
  base: '/phone-websocket/',
  title: 'enclosure-websocket',
  description: 'enclosure-websocket',
  head: [
    ['link',
      { rel: 'icon', href: '/favicon.ico' }
    ],
  ],
  themeConfig: {
    logo: '/logo.jpg',
    lastUpdated: 'LastUpdated',
    nav: [
      { text: '首页', link: '/' },
      { text: 'Github', link: 'https://github.com/panglehaoya/enclosure-websocket' },
    ],
    sidebar: {
      '/pages/guide/':[
        {
          title: '介绍',
          collapsable: false,
          children: [
            ['introduction.md', '说明']
          ]
        },
        {
          title: '如何使用',
          collapsable: false,
          children: [
            ['init.md', '使用说明']
          ]
        }
      ],
    }
  },
  plugins: [['vuepress-plugin-code-copy', {
    align: 'bottom',
    color: '#87ceeb'
  }]]
}
