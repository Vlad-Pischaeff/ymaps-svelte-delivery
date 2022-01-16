var ghpages = require('gh-pages');

ghpages.publish(
  'public', // path to public directory
  {
    branch: 'gh-pages',
    repo: 'https://github.com/Vlad-Pischaeff/ymaps-svelte-delivery.git', // Update to point to your repository  
    user: {
      name: 'Your Name',      // update to use your name
      email: 'your@mail.com'  // Update to use your email
    },
    dotfiles: true
  },
  () => {
    console.log('Deploy Complete!')
  }
)
