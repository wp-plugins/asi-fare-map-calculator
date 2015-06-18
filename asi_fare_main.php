<?php
add_action('init', 'asi_map_register_shortcodes');
function asi_map_register_shortcodes() {
    //register shortcode   
    add_shortcode('asi-map', 'asi_map_shortcode');
}
function get_allfares()
            {
                global $wpdb;
                $table_name = $wpdb->prefix."fare";
                $fares = $wpdb->get_row("SELECT * FROM $table_name",ARRAY_A);
                return $fares;
            }
// The shortcode
function asi_map_shortcode($atts) {
	extract(shortcode_atts(array(
		"label_types" 		=> __('Taxi Type:') ,
		"label_type1" 		=> __('Sedan') ,
        "label_type2" 		=> __('Minivan/ SUV') ,
        "label_stop" 		=> __('Add Additional Stops:') ,
		"label_seat" 		=> __('Car Seats:') ,
		"label_submit" 		=> __('Submit') ,
	), $atts));
    
    $_SESSION['labels']=array(
		"label_types" 		=> __('Taxi Type:') ,
		"label_type1" 		=> __('Sedan') ,
        "label_type2" 		=> __('Minivan/ SUV') ,
        "label_stop" 		=> __('Add Additional Stops:') ,
		"label_seat" 		=> __('Car Seats:') ,
		"label_submit" 		=> __('Submit'));
         $allfare=get_allfares();
         $cartype=new asi_map_plugin_admin();
         $cartypes=$cartype->Get_allselected_car();
         $select='<select name="cartypes" id="cartypes">';
         foreach($cartypes as $car)
         {
            $select.='<option value="'.$car['fare'].'">'.$car['name'].'</option>';
         }
         $select.='</select>';
         $color=$allfare['color'];
         if($color!="")
         {
            $color='style="background-color:'.$allfare['color'].'"';
         }
        
		$displayform='<form id="order"><div class="taxi_table"'.$color.'><table id="customer_order" class="table-float">
	<tbody><tr style="border-bottom: solid 1px #104580"><td width="78"  valign="middle" style="padding-bottom: 10px">
    <div> <strong>'.$label_types.'</strong></div></td><td valign="middle"  style="padding-bottom: 10px">'.$select.'</td></tr><tr>
	<td colspan="2" style="padding-top: 15px"> 
    <input id="source" name="source" type="textbox" placeholder="Pickup Address" value="" class="addressBox" />
            </td></tr>
		<tr>
			<td colspan="2" style="padding-bottom: 10px"><strong>'.$label_stop.'</strong> 
			<input type="textbox" value="0" class="mystop" name="stops_count" id="stops_count"  style="vertical-align: middle" />
			<div id="stops_div" ></div></td></tr><tr>
        	<td colspan="2" style="border-bottom: solid 1px #104580;">
            <input type="textbox" id="destination"  name="destination"  placeholder="Drop Off Address"  class="addressBox" value=""/>
          </td>
		</tr>
    <tr style="border-bottom: solid 1px #104580">
		<td style="padding-top: 10px; padding-bottom: 10px; width: 108px;">
        	<strong>Car Seats:</strong></td>
		<td  style="padding-top: 10px; padding-bottom: 10px">
		<input type="checkbox" hidden name="baby_seat" id="baby_seat" onChange="set_baby()">   
        <select name="baby_count" id="baby_count" style="width:85px;   height: 25px; padding-left: 3px; ">
         <option value="0"> 0</option>
        <option value="1"> 1</option>
          <option value="2">2</option>
            <option value="3">3</option>
        </select></td></tr>
  	<tr><td colspan="2">
                <input type="hidden" name="distance"  id="distance" readonly value=""/>
                <input type="hidden" name="fare" id="fare" readonly value=""/>
                <input type="hidden" name="duration" id="duration" readonly value=""/>
            </td></tr>
  <tr>
    <td colspan="2" align="center" valign="bottom" style="padding-top: 12px">
      <input type="button" id="cal1" name="submit" value="Calculate" onClick="doCalculation()"/>
      <input type="button" id="res1" name="reset" value="Reset" style="margin-left: 10px;"  onclick="clear_form_elements(this.form)"/>
    </td>
  </tr>
                <input type="hidden"  name="stopfare" id="stopfare" value="'.$allfare['stop'].'"/>
                <input type="hidden"  name="milefare" id="milefare" value="'.$allfare['mile'].'"/>
                <input type="hidden"  name="seatfare" id="seatfare" value="'.$allfare['seat'].'"/>
                <input type="hidden"  name="minutefare" id="minutefare" value="'.$allfare['minute'].'"/>
                <input type="hidden"  name="currfare" id="currfare" value="'.$allfare['curr'].'"/>
                <input type="hidden"  name="latitude" id="latitude" value=""/>
                <input type="hidden" name="longitude" id="longitude" value=""/>
                <input type="hidden" name="dest_latitude" id="dest_latitude" value=""/>
                <input type="hidden" name="dest_longitude" id="dest_longitude" value=""/>
</tbody></table>
	<div class="table-float" style="text-align: center">
		<div id="po" style="display: none; text-align: left"></div> 
	</div>
	<div class="clear"></div>
</div>
<div class="clear"></div>
</form><div style="padding-top: 15px;">
    <div id="map_canvas" class="map"></div></div>';
return $displayform;
} 
?>
