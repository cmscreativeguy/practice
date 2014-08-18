Feature: Basic
	@author
    Scenario: Check if the world has not ended    
        When I navigate to "http://google.com/ncr"
        Then the page title should be "Google"