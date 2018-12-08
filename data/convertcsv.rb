require 'csv'
CSV.foreach("/Users/nwb/A/openbudget/data/FY15__FY16__FY17__FY18.csv") do |row|
  puts row
  break
end