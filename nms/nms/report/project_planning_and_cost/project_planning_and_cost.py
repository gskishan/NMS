import frappe

def execute(filters=None):
	columns, data = get_columns(filters),(get_data(filters))
	data=get_total_wise(data)


	return columns, data

def get_total_wise(data):
	from collections import defaultdict

	totals = defaultdict(lambda: defaultdict(float))

	updated_data = []

	for entry in data:
		source_table = entry.get('source_table')
		for key in entry:
			if key not in ['estimation_name', 'sub_components']:  
				try:
					value = float(entry[key])  
					totals[source_table][key] += value
				except ValueError:
					continue  

	for entry in data:
		updated_data.append(entry)  

		if entry == data[-1] or entry['source_table'] != data[data.index(entry) + 1]['source_table']:
			total_row = {'estimation_name': entry['source_table'], 'source_table': "", 'sub_components': '<b>Total</b>'}
			total_row.update(totals[entry['source_table']])  
			updated_data.append(total_row)

	return(updated_data)



def get_data(filters):
	cond=get_condition(filters)
	sql="""SELECT 
			p.name AS estimation_name,
			'Employee' AS source_table, 
			es.sub_components,
			es.price, 
			es.p_price, 
			es.price - es.p_price AS price_difference,
			es.day, 
			es.p_day, 
			es.day - es.p_day AS day_difference,
			es.amount, 
			es.p_amount, 
			es.amount - es.p_amount AS amount_difference
		FROM `tabEstimation` p
		LEFT JOIN `tabEmployee Estimation` es ON p.name = es.parent
		WHERE es.price IS NOT NULL  {0}

		UNION ALL

		SELECT 
			p.name AS estimation_name,
			'Equipments' AS source_table, 
			ac.sub_components,
			ac.price, 
			ac.p_price, 
			ac.price - ac.p_price AS price_difference,
			ac.day, 
			ac.p_day, 
			ac.day - ac.p_day AS day_difference,
			ac.amount, 
			ac.p_amount, 
			ac.amount - ac.p_amount AS amount_difference
		FROM `tabEstimation` p
		LEFT JOIN `tabAsset Estimation CT` ac ON p.name = ac.parent
		WHERE ac.price IS NOT NULL  {0}
		UNION ALL

		SELECT 
			p.name AS estimation_name,
			'Boats And Vehicles' AS source_table, 
			ect.sub_components,
			ect.price, 
			ect.p_price, 
			ect.price - ect.p_price AS price_difference,
			ect.day, 
			ect.p_day, 
			ect.day - ect.p_day AS day_difference,
			ect.amount, 
			ect.p_amount, 
			ect.amount - ect.p_amount AS amount_difference
		FROM `tabEstimation` p
		LEFT JOIN `tabEstimation Ct` ect ON p.name = ect.parent
		WHERE ect.price IS NOT NULL {0}

		UNION ALL

		SELECT 
			p.name AS estimation_name,
			'Sub-Contractor' AS source_table, 
			sc.sub_components,
			sc.price, 
			sc.p_price, 
			sc.price - sc.p_price AS price_difference,
			sc.day, 
			sc.p_day, 
			sc.day - sc.p_day AS day_difference,
			sc.amount, 
			sc.p_amount, 
			sc.amount - sc.p_amount AS amount_difference
		FROM `tabEstimation` p
		LEFT JOIN `tabSub-Contractor CT` sc ON p.name = sc.parent
		WHERE sc.price IS NOT NULL  {0}

		UNION ALL

		SELECT 
			p.name AS estimation_name,
			'Additional Cost' AS source_table, 
			acc.sub_components,
			acc.price, 
			acc.p_price, 
			acc.price - acc.p_price AS price_difference,
			acc.day, 
			acc.p_day, 
			acc.day - acc.p_day AS day_difference,
			acc.amount, 
			acc.p_amount, 
			acc.amount - acc.p_amount AS amount_difference
		FROM `tabEstimation` p
		LEFT JOIN `tabAdditional Cost CT` acc ON p.name = acc.parent
		WHERE acc.price IS NOT NULL  {0}

		UNION ALL

		SELECT 
			p.name AS estimation_name,
			'Site Consumable' AS source_table, 
			sct.sub_components,
			sct.price, 
			sct.p_price, 
			sct.price - sct.p_price AS price_difference,
			sct.day, 
			sct.p_day, 
			sct.day - sct.p_day AS day_difference,
			sct.amount, 
			sct.p_amount, 
			sct.amount - sct.p_amount AS amount_difference
		FROM `tabEstimation` p
		LEFT JOIN `tabSite Consumable Ct` sct ON p.name = sct.parent
		WHERE sct.price IS NOT NULL  {0}

		UNION ALL

		SELECT 
			p.name AS estimation_name,
			'Fuel Consumption' AS source_table, 
			fc.sub_components,
			fc.price, 
			fc.p_price, 
			fc.price - fc.p_price AS price_difference,
			fc.day, 
			fc.p_day, 
			fc.day - fc.p_day AS day_difference,
			fc.amount, 
			fc.p_amount, 
			fc.amount - fc.p_amount AS amount_difference
		FROM `tabEstimation` p
		LEFT JOIN `tabFuel Consumption CT` fc ON p.name = fc.parent
		WHERE fc.price IS NOT NULL {0}

		""".format(cond)
	frappe.errprint(sql)
	data=frappe.db.sql(sql,as_dict=1)
	return data

def get_condition(filters):
    cond = ""
    if filters.get("project"):
        cond += "and p.project='{0}'".format(filters.get("project"))
    if filters.get("from_date") and filters.get("to_date"):
        from_date = filters.get("from_date")
        to_date = filters.get("to_date")
        # Ensure both values are non-empty strings
        if from_date and to_date:
            cond += " and p.date between '{0}' and '{1}'".format(from_date, to_date)
        else:
            raise ValueError("Both 'from_date' and 'to_date' must be valid.")
    return cond


def get_columns(filters):
	columns=[]

	columns+= [
	
		{
	 		'fieldname': 'estimation_name',
            'label':('Components'),
            'fieldtype': 'Data',
			'width': 200,
			"hidden":1
        },
		{
	 		'fieldname': 'sub_components',
            'label':('Components'),
            'fieldtype': 'Data',
			'width': 200
        },
		{
	 		'fieldname': 'price',
            'label':('Price'),
            'fieldtype': 'Float',
			'width': 200
        },
		{
	 		'fieldname': 'day',
            'label':('Day'),
            'fieldtype': 'Int',
			'width': 200
        },
		{
	 		'fieldname': 'amount',
            'label':('Amount'),
            'fieldtype': 'Float',
			'width': 200
        },
		{
	 		'fieldname': 'p_price',
            'label':('Price'),
            'fieldtype': 'Float',
			'width': 200
        },
		{
	 		'fieldname': 'p_day',
            'label':('Day'),
            'fieldtype': 'Int',
			'width': 200
        },
		{
	 		'fieldname': 'p_amount',
            'label':('Amount'),
            'fieldtype': 'Float',
			'width': 200
        },
		{
	 		'fieldname': 'price_difference',
            'label':('Price'),
            'fieldtype': 'Float',
			'width': 200
        },
		{
	 		'fieldname': 'day_difference',
            'label':('Day'),
            'fieldtype': 'Int',
			'width': 200
        },
		{
	 		'fieldname': 'amount_difference',
            'label':('Amount'),
            'fieldtype': 'Float',
			'width': 200
        }]
	return columns
