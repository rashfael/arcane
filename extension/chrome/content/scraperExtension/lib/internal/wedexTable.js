/**
 * This class provides possibilities to easily create and manage a sortable html table with various types of cell and header elements including all input types and select box yet.
 */
var WedexTable = (function() {
	
	/**
	 * Creates a new WedexTable Object. Therefore a new sortable html table is created and added to the passed parent.
	 * The specified datamodel defines the columns and rows the table shouls contain. More information on the datamodel
	 * can be found on http://wedex.iao.fraunhofer.de/projects/wedex/wiki/WedexTable
	 * @param {jQuery} parent A jQuery-Object containing a DOM node to which the table should be appended to.
	 * @param {Object} dataModel The datamodel of the table (http://wedex.iao.fraunhofer.de/projects/wedex/wiki/WedexTable)
	 * @param {jQuery/DOM} context The context of the html table. Can be null.
	 * 
	 */
	function WedexTable(parent, dataModel, context) {
		var obj=this;
		if(parent==null)
			throw new Error("Parent can not be null");
		if(dataModel==null)
			throw new Error("DataModel can not be null");
		if(context==null){
			this.context=fbDocument;
		}else{
			this.context=context;
		}
		
		this.tableWidth=0;
		this.columnWidths=new Array();
		this.id=idGenerator.getID();
		this.parent=parent;
		this.dataModel=dataModel;
		this.tableIDs= new Array();
		this.selectedCellIndices= {
			row: -1,
			col: -1
		};	
			
			
		var tableContainer=$('<div id="'+this.id+'OuterDiv" class="fixed-table-container sort-decoration"><div class="header-background"></div><div id="'+this.id+'InnerDiv" class="fixed-table-container-inner" style="overflow-y: visible; overflow-x: visible; height:100%"></div></div>',this.context);
		parent.append(tableContainer);
	    
		this.update(dataModel);
		
		$.tablesorter.addParser({
	        // set a unique id
	        id: 'inputParser',
	        is: function(s) {
	            // return false so this parser is not auto detected
	            return false;
	        },
	        format: function(s, table, cell) {
				return $('input', cell).val();
			},
	        // set type, either numeric or text
	        type: 'text'
	    });
	    
		$.tablesorter.addParser({
	        // set a unique id
	        id: 'selectParser',
	        is: function(s) {
	            // return false so this parser is not auto detected
	            return false;
	        },
	        format: function(s, table, cell) {
				return $('option:selected', cell).val();
			},
	        // set type, either numeric or text
	        type: 'text'
	    });
		
	};

	/**
	 * Returns the outer div of the table. Contains the inner div too.
	 * @return {jQuery} The div containing the whole table structure.
	 */
	WedexTable.prototype.getOuterDiv = function() {
		return $('#'+this.id+'OuterDiv',this.context);
	};
	
	/**
	 * Returns the inner div of the table.
	 * @return {jQuery} The div containing the table only.
	 */
	WedexTable.prototype.getInnerDiv = function() {
		return $('#'+this.id+'InnerDiv',this.context);
	};
	
	/**
	 * Returns the html table.
	 * @return {jQuery} The table as jQuery object.
	 */
	WedexTable.prototype.getTable = function() {
		return $('#'+this.id+'Table',this.context);
	};
	
	/**
	 * Returns the cell as jQuery object by its indices.
	 * @param {Integer} columnIndex The index of the cells column.
	 * @param {Integer} rowIndex The index of the cells row.
	 * @return {jQuery} The cell with the given indices.
	 */
	WedexTable.prototype.getCell = function(columnIndex, rowIndex) {
		//Check if indices are negative
		if(columnIndex<0||rowIndex<0)
			throw new Error("Indices have to be non negative.");
		//Check if indices are negative
		if(rowIndex>this.tableIDs.length||this.tableIDs[rowIndex].cellIDs.length){
			throw new Error("Index out of bounds.");
		}
		var cellSel="#"+this.tableIDs[rowIndex].cellIDs[columnIndex];
		return jQuery(cellSel,this.context);
	};
	
	WedexTable.prototype.getRow = function(rowIndex) {
		if(this.tableIDs.length>=rowIndex)
			var rowSel="#"+this.tableIDs[rowIndex].rowID;
		else
			return null;
		return jQuery(rowSel,this.context);
	};
	
	/**
	 * Returns the index of the selected row. If no row is selected -1 is returned.
	 * @return {Integer} The index of the selected row.
	 */
	WedexTable.prototype.getSelectedRowIndex = function(){
		return this.selectedCellIndices.row;
	};

	/**
	 * Returns the indices of the selected cell. If no cell is selected { row:-1, col:-1} is returned.
	 * @return {Object} The indices of the selected cell. Structure:
	 * 					{
	 * 						row: "",
	 * 						col: ""
	 * 					}
	 */	
	WedexTable.prototype.getSelectedCellIndices = function(){
		return this.selectedCellIndices;
	};
	
	
	/**
	 * Return the columns tds of the column with the given index.
	 * @param {Integer} columnIndex The index of the column.
	 */
	WedexTable.prototype.getColumn = function(columnIndex) {
		var context, tds;
		context=this.context;
		tds=new Array();
		jQuery.each(this.tableIDs,function(){
			var cellSel="#"+this.cellIDs[columnIndex];
			tds.push(jQuery(cellSel,context));
		});
		return tds;
	};
	
	/**
	 * Calculates the index of the selected row. Used for click on row.
	 * @return {Integer} The index of the selected row.
	 */
	WedexTable.prototype.calculateSelectedRowIndex = function(){
		var context=this.context;
		var selRowIndex=-1;
		//Currently single selection only
		jQuery.each(this.tableIDs,function(index){
			var firstTd=jQuery("#"+this.rowID,context).find("td:first");
			if(firstTd.hasClass("wedexTableRowSelection")==true){
				selRowIndex=index;
			}
		});
		return selRowIndex;
	};

	/**
	 * Calculates the indices of the selected cell. Used for click on cell.
	 * @return {Object} The indices of the selected cell. Structure:
	 * 					{
	 * 						row: "",
	 * 						col: ""
	 * 					}
	 */	
	WedexTable.prototype.calculateSelectedCellIndices  = function(){
		var context=this.context;
		var selRowIndex=-1;
		var selColumnIndex=-1;
		
		//Currently single selection only
		jQuery.each(this.tableIDs,function(rowIndex){
			var row=jQuery("#"+this.rowID,context);
			var firstTd=row.find("td:first");
			if(firstTd.hasClass("wedexTableRowSelection")==true){
				selRowIndex=rowIndex;
				jQuery.each(row.find("td"),function(colIndex,td){
					var jqTd=jQuery(td,context).hasClass("wedexTableCellSelection");
					if(jqTd==true){
						selColumnIndex=colIndex;
					}
				})
			}
		});
		return { row: selRowIndex, col:selColumnIndex};
	};
	
	/**
	 * Unselects cell/row and therefore resets the selection indices.
	 */
	WedexTable.prototype.resetSelection = function(){
		this.selectedCellIndices.row=-1;
		this.selectedCellIndices.col=-1;
	};
	
	/**
	 * Informs the table about the fact, that a cell was removed.
	 */
	WedexTable.prototype.cellRemoved = function(){
		if (this.selectedCellIndices.col>=this.tableIDs.length-1)
			this.selectedCellIndices.col--;
	};
	
	/**
	 * Selects (and highlights) the passed row or the row with the given index if row is null. Used by click listener and restore functionality.
	 * @param {jQuery} row The row which shall be selected. Can be null.
	 * @param {Integer} rowIndex The index of the row which shall be selected. Can be null.
	 */
	WedexTable.prototype.selectRow = function(row, rowIndex){
		if(row==null&&(rowIndex==null||rowIndex==-1))
			throw new Error("Selection information missing.");
		//Currently single selection only
		this.getTable().find("td").removeClass("wedexTableRowSelection");
		if(row==null)
			row=jQuery("#"+this.tableIDs[rowIndex].rowID, this.context);
		row.find("td").addClass("wedexTableRowSelection");
		if(rowIndex==null)
			this.selectedCellIndices.row=this.calculateSelectedRowIndex();
		else
			this.selectedCellIndices.row=rowIndex;
	};
	
	/**
	 * Selects the last row of the table.
	 */
	WedexTable.prototype.selectLastRow = function(){
		this.selectedCellIndices.row=this.tableIDs.length;
		
		if(this.selectedCellIndices.col==-1)
			this.selectedCellIndices.col=0;
	};
	
	/**
	 * Selects (and highlights) the passed cell or the cell with the given indices if cell is null. Used by click listener and restore functionality.
	 * @param {jQuery} cell The cell which shall be selected. Can be null.
	 * @param {Integer} rowIndex The index of the cells row which shall be selected. Can be null.
	 * @param {Integer} colIndex The index of the cells column which shall be selected. Can be null.
	 */
	WedexTable.prototype.selectCell = function(cell, rowIndex, colIndex){
		if(cell==null&&(rowIndex==null||rowIndex==-1||colIndex==null||colIndex==-1))
			throw new Error("Selection information missing.");
		
		//Currently single selection only
		this.getTable().find("td").removeClass("wedexTableCellSelection");
		if(cell==null)
			cell=jQuery("#"+this.tableIDs[rowIndex].cellIDs[colIndex], this.context);
		cell.addClass("wedexTableCellSelection");
		cell.children()[0].focus();
		if(rowIndex==null||colIndex==null)
			this.selectedCellIndices=this.calculateSelectedCellIndices();
		else{
			this.selectedCellIndices.row=rowIndex;
			this.selectedCellIndices.col=colIndex;
		}
		if(this.dataModel.cellSelection==false)
			cell.removeClass("wedexTableCellSelection");
		
	};
	
	/**
	 * Removes the currently selected row and resets the selection indices.
	 * @return {Boolean} Returns true if table is not empty.
	 */
	WedexTable.prototype.removeSelectedRow = function(){
		var rowID=this.tableIDs[this.selectedCellIndices.row].rowID;
		jQuery("#"+rowID,this.context).remove();
		this.tableIDs.splice(this.selectedCellIndices.row,1);
		if(this.selectedCellIndices.row>=this.dataModel.rows.length-1){
			this.selectedCellIndices.row-=1;
			return true;
		}else if(this.dataModel.rows.length==0){
			this.selectedCellIndices.row=-1;
			this.selectedCellIndices.col=-1;
			return false;
		}
		return true;
	};
	
	/**
	 * Draws the rows specified in the datamodel.
	 * @param {jQuery} tableContainer The container the rows shall be added to.
	 */
	WedexTable.prototype.drawRows = function(tableContainer){
		var obj=this;
		
		jQuery.each(this.dataModel.rows, function(){
			obj.addRow(this);
		});
		
	};
	
	/**
	 * Adds a row with the passed data to the table.
	 * @param {object} data The data concerning the row. (http://wedex.iao.fraunhofer.de/projects/wedex/wiki/WedexTable)
	 */
	WedexTable.prototype.addRow = function(data){
		var tBody, row, tableContainer, dataModel, obj, id;
		
		tableContainer=this.getOuterDiv();
		dataModel=this.dataModel;
		obj=this;
		id=this.id;
				
		tBody=$('#'+this.id+'Body',tableContainer);
		
		var _rowID=this.id+idGenerator.getID();
		
		var rowIDs={ rowID:_rowID, cellIDs : []};
		
		
		row=$('<tr id="'+_rowID+'"/>',tableContainer);
		
		
		jQuery.each(data,function(index){
			var currentColDef=dataModel.columns[index].content;
			
			var cellID=id+idGenerator.getID();
			rowIDs.cellIDs.push(cellID);
			var colWidth=obj.columnWidths[index];
			if(currentColDef.width!=null)
				colWidth=currentColDef.width;
			
			
			var td=$('<td id="'+cellID+'"/>',tableContainer);
			td.width(colWidth);
			var content=jQuery('<'+currentColDef.element+'/>',tableContainer);
			if(currentColDef.type!="checkbox" && currentColDef.type!="radio")
				content.width(colWidth-10);
			
			if(currentColDef.element=="select"){
				jQuery.each(currentColDef.value,function(){
					var option=$('<option value="'+this.value+'">'+this.text+"</option>",content);
					if(data[index].value==this.value)
						option.attr("selected","selected");
					content.append(option);
				});
			}
			
			content.text(data[index].text);
			
			if(currentColDef.type!=null)
				content.attr("type",currentColDef.type);

			if(currentColDef.readonly!=null&&currentColDef.readonly!=false){
				content.attr("disabled",true);
			}
			
			//Set value. Make type check because checkbox and radio button behave different thne the other inputs	
			if(currentColDef.type=="checkbox" || currentColDef.type=="radio"){
				if(data[index].value!=""&&data[index].value!=null)
					content.attr("checked",data[index].value);
				
				//Register click event on input because change is buggy and does not work for checkboxes for example
				content.click(function(event){
						
						content.val(content.attr("checked")=="checked");
						if(currentColDef.valueChangedAction!=null)
							currentColDef.valueChangedAction(content,obj);
						obj.getTable().trigger("update");
						td.click(); 
							
					}
				);
			}else{
				if(currentColDef.valueChangedAction!=null){
					content.change(function(event){
						
						//Necessary for sorting of text inputs
						if(currentColDef.type=="text")
							content.attr("value",content.val());
							
						currentColDef.valueChangedAction(content,obj);
						obj.getTable().trigger("update");
						td.click();
					}
				);
			}
			}
			
			// Register selection listener
			td.click( function(event){
				obj.selectRow(row);
				obj.selectCell(td);
				
			});
			
			// Register focusout listener
			content.focusin( function(event){

				obj.selectRow(row);
				obj.selectCell(td);
				
				currentColDef.selectAction(td,obj);

			});
			
			
			if(currentColDef.selectAction!=null){
				td.click(
					function(event){
						event.stopPropagation();
						currentColDef.selectAction(td,obj);

					}
				);
			};
			
			content.val(data[index].value);
							
			td.append(content);
			
			row.append(td);
			
		});
		this.tableIDs.push(rowIDs);
		
		tBody.append(row);
		
		return row;
	};
	
	/**
	 * Draws the columns specified in the datamodel.
	 * @param {jQuery} tableContainer The container the columns shall be added to.
	 */
	WedexTable.prototype.drawColumns = function(tableContainer){
		
		var id, dataModel, obj;
		id=this.id;
		dataModel=this.dataModel;
		obj=this;
		
		//Build dump if no coludatamodele defined
		if(dataModel.columns.length==0){
			var dump={header : {

					},
			}
			dataModel.columns.push(dump);
		}
		
		//Draw columns from table definition
		jQuery.each(dataModel.columns,function(){
			
			var headerDef=this.header;
			
			var headerRow, header, content, sortSpan, div;		
			
			header=$('<th/>',tableContainer);
			
			div=$('<div class="th-inner"/>',tableContainer);
			
			var elType=headerDef.element;
			if(elType==null)
				elType="span"
			content=jQuery('<'+elType+'/>',tableContainer);
			
			if(headerDef.tooltip!=null&&headerDef.tooltip.trim()!="")
				content.attr("title",headerDef.tooltip);
			
			if(headerDef.selectAction!=null){
				header.click(
					function(){
						headerDef.selectAction(content,obj);
					}
				);
			}
			
			if(headerDef.text!=null)
				content.text(headerDef.text);
			else
				content.text("-");
			
			if(headerDef.type!=null)
				content.attr("type",headerDef.type);

			if(headerDef.readonly!=null&&headerDef.readonly!=false){
				content.attr("disabled",true);
			}
				
			if(headerDef.type=="checkbox" || headerDef.type=="radio"){
				if(headerDef.value!=""&&headerDef.value!=null)
					content.attr("checked",headerDef.value);
			}
				
			//Set value. Make type check because checkbox and radio button behave different thne the other inputs	
			if(headerDef.type=="checkbox" || headerDef.type=="radio"){
				
				//Register click event on input because change is buggy and does not work for checkboxes for example
				content.click(function(event){
						event.stopPropagation();
						content.val(content.attr("checked")=="checked");
						if(headerDef.valueChangedAction!=null)
							headerDef.valueChangedAction(content,obj);
							
					}
				);
			}else{
				if(headerDef.valueChangedAction!=null){
					content.change(function(){
						headerDef.valueChangedAction(content,obj);
						}
					);
				}
			}

			headerRow=$('#'+id+'HeaderRow',tableContainer);
			if(headerDef.value!=null)
				content.val(headerDef.value);
			
			div.append(content);
			
			if(headerDef.sortable==true){	
				sortSpan=$('<span class="sortArrow">&nbsp;</span>',tableContainer);
				div.append(sortSpan);
			}
			
			header.append(div);
			headerRow.append(header);
			
			if(headerDef.width!=null)
				div.width(headerDef.width);
			
			obj.tableWidth+=div.outerWidth(true);
			header.width(div.outerWidth(true));
			obj.columnWidths.push(div.outerWidth(true));
		});
		
	};
	
	/**
	 * Initializes the tablesorter plugin.
	 */
	WedexTable.prototype.initializeSorter = function(usrArgs){
		var args=usrArgs;
		if(usrArgs==null){
			args={

				headers:{}
			};
			jQuery.each(this.dataModel.columns,function(index){
				if(this.header.sortable==false||this.header.sortable==null){
					args.headers[index]={};
					args.headers[index].sorter=false;
				}else{
					if(this.content.element=="input"){
						args.headers[index]={};
						args.headers[index].sorter="inputParser";
					}else if(this.content.element=="select"){
						args.headers[index]={};
						args.headers[index].sorter="selectParser";
					}
						
				}

			});
		}
		if(jQuery.isEmptyObject(args.headers)){
			this.getTable().tablesorter();
			return;
		}
		this.getTable().tablesorter(args);

	}
	
	/**
	 * Method to update the ui of the table. Restores row/cell selection automatically.
	 * @ {Object} datamodel The datamodel of the table. (http://wedex.iao.fraunhofer.de/projects/wedex/wiki/WedexTable)
	 */
	WedexTable.prototype.update = function(datamodel){
		var obj=this;
		if(datamodel==null)
			throw new Error("DataModel can not be null");
		this.getTable().remove();
		this.tableIDs= new Array();
		this.columnWidths=new Array();
		this.tableWidth=0;
		var tableContainer=$('<table id="'+this.id+'Table" class="tablesorter"><thead><tr id="'+this.id+'HeaderRow"></tr></thead><tbody id="'+this.id+'Body"></tbody></table>',this.context);
		this.getInnerDiv().append(tableContainer);
		this.dataModel=datamodel;
		this.drawColumns(tableContainer);
		var innerDiv=jQuery("#"+this.id+"InnerDiv",this.context);
		if(this.tableWidth>jQuery("#"+this.id+'InnerDiv',this.context).width()){
			innerDiv.width(this.tableWidth);
			tableContainer.width(this.tableWidth);
		}else{
			innerDiv.width("100%");
			tableContainer.width("100%");
		}
		obj.drawRows(tableContainer);
		
		//Callback if last row is drawn
		obj.initializeSorter();
	
		//Select no dataset if column of step before does not exist anymore or no columns or rows exist.
		if(obj.selectedCellIndices.col>datamodel.columns.length-1||datamodel.columns.length==0||datamodel.rows.length==0){
			obj.selectedCellIndices.col=-1;
			obj.selectedCellIndices.row=-1;
		}
		//Restore row selection
		if(obj.selectedCellIndices.row>=0){
			obj.selectRow(null,obj.selectedCellIndices.row);
		}
		
		//Restore cell selection
		if((obj.selectedCellIndices.row>=0&&obj.selectedCellIndices.col>=0)){
			obj.selectCell(null,obj.selectedCellIndices.row,obj.selectedCellIndices.col);
		}
		
		
		
		
		
	};
	
	return WedexTable;	
	
})();
