<?php
/*
 Plugin Name: ASI Fare Map Calculator
 Description: This plugin calculates fare, distance, duration and also show the route on google map. Use [asi-map] shortcode to display fare/map calculator.
 Version: 1.0
 Plugin URI: http://www.adaptivesolutionsinc.com/
 Author: Adaptive Solutions Inc
 Author URI: http://www.adaptivesolutionsinc.com/
 License: GNU General Public License v3 or later
*/
define('ABSPATH', dirname(__FILE__) . '/');
function asi_map_scripts() {	
	if(!is_admin())
	{ 
        $google_map_api = 'https://maps.google.com/maps/api/js?sensor=true&libraries=places&language=en-AU';
        wp_enqueue_script('google-places', $google_map_api);
        wp_register_style('asi_style', plugins_url('css/asi_fare_style.css',__FILE__));
        wp_enqueue_style('asi_style');
       	wp_register_script('asi_script', plugins_url('js/asi_fare_script.js', __FILE__ ),array('jquery'));
        wp_enqueue_script('asi_script');    
	}
}
add_action('wp_enqueue_scripts', 'asi_map_scripts');
// Create Tables 
register_activation_hook(__FILE__,'asi_map_create_table');
function asi_map_create_table()
{
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    $tablename=$wpdb->prefix.'fare';
    if($wpdb->get_var("SHOW TABLES LIKE '$tablename'")!=$tablename)
    {
            $sql = "CREATE TABLE $tablename (
                    fare_id INT(11) NOT NULL AUTO_INCREMENT,
                    mile TEXT, 
                    stop TEXT, 
                    seat TEXT, 
                    minute TEXT,
                    curr TEXT, 
                    color TEXT,
                    PRIMARY  KEY (fare_id)
                    )$charset_collate;";  
            require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
            dbDelta($sql);
    $wpdb->query($wpdb->prepare("INSERT INTO $tablename(mile,stop,seat,minute,curr,color) VALUES(%s,%s,%s,%s,%s,%s)", array(0,0,0,0,'$','#B4D568')));        
            
    }    
    $tablecar=$wpdb->prefix.'cartypes';
    if($wpdb->get_var("SHOW TABLES LIKE '$tablecar'")!=$tablecar)
    {
            $sql = "CREATE TABLE $tablecar (
                    c_id INT(11) NOT NULL AUTO_INCREMENT,
                    name VARCHAR(50) NOT NULL, 
                    fare TEXT,                 
                    PRIMARY  KEY (c_id)
                    )$charset_collate;";  
            require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
            dbDelta($sql);            
    }    
}
function asi_map_deletecar_process()
{
    global $wpdb;
    $id=sanitize_text_field($_POST['id']);
    $table_name = $wpdb->prefix."cartypes";
    $wpdb->query($wpdb->prepare("DELETE FROM $table_name WHERE c_id=%d",$id));     
    exit;
}
add_action('wp_ajax_asi_map_deletecar','asi_map_deletecar_process');
echo '<input type="hidden" value="'.plugins_url().'" id="homeurlid" />';
include 'asi_fare_main.php';
include 'asi_fare_admin.php';
?>