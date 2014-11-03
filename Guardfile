# guard init shell

# Compile article template styles (minified)
guard 'sass', :output => 'ArticleTemplates/assets/css', :syntax => :scss, :style => :compressed do
    watch(%r{ArticleTemplates/assets/scss/.+})
end

# Compile documentation styles
guard 'sass', :output => 'DocumentationTemplates/assets/css', :syntax => :scss do
    watch(%r{DocumentationTemplates/assets/scss/.+})
end

# Sass Lint
guard :shell do
    watch(%r{ArticleTemplates/assets/scss/.+}) {
        |m| eager 'scss-lint ArticleTemplates/assets/scss'
    }
end

# JS Lint
guard 'jslint-on-rails' do
    watch(%r{ArticleTemplates/assets/js/.+})
    # watch('config/jslint.yml')
end

# JS concat

# Build documentation
guard 'hologram', config_path: 'hologram.yml' do
    watch(%r{ArticleTemplates/assets/scss/.+})
    watch(%r{DocumentationTemplates.+})
    watch('hologram.yml')
end

guard :jammit , :config_path => 'assets.yml', :public_root => 'ArticleTemplates' do
  watch(%r{^ArticleTemplates/assets/js/(.*)\.js$})
end
