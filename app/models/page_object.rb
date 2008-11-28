class PageObject < ActiveRecord::Base
  include ThriveSmartObjectMethods
  self.caching_default = 'interval[5]' #[in :forever, :page_update, :any_page_update, 'data_update[datetimes]', :never, 'interval[5]']
  
  serialize :listings, Array
  
  attr_accessor :full_listings
  
  def after_initialize
    self.full_listings = []
  end
  
  # Override caching information to be on data_update of the data path
  def caching
    @caching = "data_update[#{data_path}]"
  end
  
  def piped_listings=(str)
    self.listings = str.blank? ? [] : str.split('|')
  end
  
  def piped_listings
    self.listings ? self.listings.join('|') : ''
  end
  
  def fetch_data(attrs = {})
    data = self.organization.find_data(self.data_path, 
      :include => [:url, :name, :description, :picture], 
      :conditions => { :urn => listings })
      
    self.full_listings = []
    (listings || []).each do |l| 
      match = data.detect {|d| d.urn == l}
      full_listings << match if match
    end
  end
  
  alias_method :original_to_xml, :to_xml
  def to_xml(options = {})
    original_to_xml({:except => [:listings]}.merge(options))
  end
end
