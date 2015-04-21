select naics,GROUP_CONCAT(year) from (SELECT naics, year FROM [zbp.zbp_details] group by naics,year order by year asc) group by naics
