# Compile article template styles
guard 'sass', :output => 'ArticleTemplates/assets/css', :syntax => :scss do
  watch(%r{ArticleTemplates/assets/scss/.+})
end

# Compile documentation styles
guard 'sass', :output => 'DocumentationTemplates/assets/css', :syntax => :scss do
  watch(%r{DocumentationTemplates/assets/scss/.+})
end

# Build documentation
guard 'hologram', config_path: 'hologram.yml' do
  watch(%r{ArticleTemplates/assets/scss/.+})
  watch(%r{DocumentationTemplates.+})
  watch('hologram.yml')
end