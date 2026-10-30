<?php

namespace Database\Seeders;

use App\Models\FoodItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FoodItemSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['name' => 'Chicken Biryani', 'category' => 'Biryani', 'description' => 'Fragrant basmati rice layered with spiced chicken, caramelised onions and herbs.', 'price' => 1800, 'image_url' => 'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Beef Biryani', 'category' => 'Biryani', 'description' => 'Aromatic biryani rice served with tender beef, warm spices and cooling raita.', 'price' => 1950, 'image_url' => 'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Mutton Biryani', 'category' => 'Biryani', 'description' => 'Slow-cooked mutton and fragrant spiced rice with herbs and fried onions.', 'price' => 2500, 'image_url' => 'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Special Biryani', 'category' => 'Biryani', 'description' => 'A generous house biryani with spiced rice, meat, egg, fried onions and raita.', 'price' => 2800, 'image_url' => 'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Chicken Fried Rice', 'category' => 'Fried Rice', 'description' => 'Wok-fried rice tossed with chicken, egg, leeks and spring onion.', 'price' => 1450, 'image_url' => 'https://assets.st-note.com/img/1673140816498-PukCJ7Ecek.jpg?fit=bounds&height=2000&quality=85&width=2000', 'is_available' => true],
            ['name' => 'Beef Fried Rice', 'category' => 'Fried Rice', 'description' => 'Wok-fried rice with seasoned beef, egg and vegetables.', 'price' => 1600, 'image_url' => 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Egg Fried Rice', 'category' => 'Fried Rice', 'description' => 'Rice tossed over high heat with egg, vegetables and savoury seasoning.', 'price' => 1100, 'image_url' => 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Mixed Fried Rice', 'category' => 'Fried Rice', 'description' => 'A filling wok-fried rice with chicken, beef, egg and vegetables.', 'price' => 1750, 'image_url' => 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Seafood Fried Rice', 'category' => 'Fried Rice', 'description' => 'Wok-fried rice with prawns, seafood, egg and fresh vegetables.', 'price' => 1850, 'image_url' => 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Chicken Kothu', 'category' => 'Kothu', 'description' => 'Chopped godamba roti tossed on the hot plate with chicken, egg and vegetables.', 'price' => 1450, 'image_url' => 'https://static.wixstatic.com/media/2c5798_5a26efced0804cbe897cd04e7927bd3b~mv2.jpg/v1/fill/w_618%2Ch_686%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01/2c5798_5a26efced0804cbe897cd04e7927bd3b~mv2.jpg', 'is_available' => true],
            ['name' => 'Beef Kothu', 'category' => 'Kothu', 'description' => 'Chopped roti stir-fried with tender beef, egg, vegetables and house spices.', 'price' => 1650, 'image_url' => 'https://static.wixstatic.com/media/2c5798_5a26efced0804cbe897cd04e7927bd3b~mv2.jpg/v1/fill/w_618%2Ch_686%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01/2c5798_5a26efced0804cbe897cd04e7927bd3b~mv2.jpg', 'is_available' => true],
            ['name' => 'Egg Kothu', 'category' => 'Kothu', 'description' => 'Chopped godamba roti tossed with egg, vegetables and flavourful curry seasoning.', 'price' => 1100, 'image_url' => 'https://static.wixstatic.com/media/2c5798_5a26efced0804cbe897cd04e7927bd3b~mv2.jpg/v1/fill/w_618%2Ch_686%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01/2c5798_5a26efced0804cbe897cd04e7927bd3b~mv2.jpg', 'is_available' => true],
            ['name' => 'Cheese Kothu', 'category' => 'Kothu', 'description' => 'Hot-plate chopped roti with melted cheese, vegetables and your choice of savoury spices.', 'price' => 1450, 'image_url' => 'https://static.wixstatic.com/media/2c5798_5a26efced0804cbe897cd04e7927bd3b~mv2.jpg/v1/fill/w_618%2Ch_686%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01/2c5798_5a26efced0804cbe897cd04e7927bd3b~mv2.jpg', 'is_available' => true],
            ['name' => 'Special Kothu', 'category' => 'Kothu', 'description' => 'House special chopped roti with mixed meat, egg, vegetables and a rich curry finish.', 'price' => 1900, 'image_url' => 'https://www.pastimahiyangana.lk/images/menu/kottu/seafood-dolpin-kottu.webp', 'is_available' => true],
            ['name' => 'Fried Chicken (2 Pcs)', 'category' => 'Chicken', 'description' => 'Two pieces of seasoned chicken fried until crisp outside and juicy inside.', 'price' => 1200, 'image_url' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Grill Chicken (Half)', 'category' => 'Chicken', 'description' => 'Half a chicken marinated with house spices and grilled until tender.', 'price' => 2200, 'image_url' => 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Grill Chicken (Full)', 'category' => 'Chicken', 'description' => 'A whole chicken marinated in house seasoning and grilled for a smoky finish.', 'price' => 4200, 'image_url' => 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Chicken Wings (6 Pcs)', 'category' => 'Chicken', 'description' => 'Six chicken wings seasoned and cooked until golden, served hot.', 'price' => 1400, 'image_url' => 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'French Fries', 'category' => 'Short Eats', 'description' => 'Golden potato fries with a crisp outside and fluffy centre.', 'price' => 650, 'image_url' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Chicken Nuggets (6 Pcs)', 'category' => 'Short Eats', 'description' => 'Six bite-sized chicken nuggets with a crunchy coating.', 'price' => 900, 'image_url' => 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Chicken Samosa (1 Pc)', 'category' => 'Short Eats', 'description' => 'One crisp pastry filled with seasoned chicken and spices.', 'price' => 250, 'image_url' => 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Vegetable Samosa (1 Pc)', 'category' => 'Short Eats', 'description' => 'One golden pastry filled with a mildly spiced vegetable mix.', 'price' => 180, 'image_url' => 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Fish Cutlet (1 Pc)', 'category' => 'Short Eats', 'description' => 'One crunchy crumbed cutlet with a savoury fish and potato filling.', 'price' => 250, 'image_url' => 'https://d1wvfb9o4f1cvo.cloudfront.net/2021/09/Cutlets.jpg', 'is_available' => true],
            ['name' => 'Egg Roll (1 Pc)', 'category' => 'Short Eats', 'description' => 'One crisp roll wrapped around a savoury egg and vegetable filling.', 'price' => 250, 'image_url' => 'https://i0.wp.com/chefbhadri.food.blog/wp-content/uploads/2020/09/vegroti_1800_1200.jpg?ssl=1', 'is_available' => true],
            ['name' => 'Parotta (1 Pc)', 'category' => 'Extras', 'description' => 'One soft, flaky layered flatbread, cooked fresh and served warm.', 'price' => 150, 'image_url' => 'https://images.unsplash.com/photo-1619714604987-2f6caead7850?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Egg (1 Pc)', 'category' => 'Extras', 'description' => 'One cooked egg, available as an extra with your meal.', 'price' => 150, 'image_url' => 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Raita', 'category' => 'Extras', 'description' => 'A cool yoghurt side with fresh vegetables and gentle seasoning.', 'price' => 250, 'image_url' => 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
            ['name' => 'Gravy', 'category' => 'Extras', 'description' => 'A portion of savoury house gravy to enjoy with rice or flatbread.', 'price' => 300, 'image_url' => 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85', 'is_available' => true],
        ];

        $imageUrls = [
            'Chicken Biryani' => 'https://media-assets.swiggy.com/swiggy/image/upload/f_auto%2Cq_auto%2Cfl_lossy/53ccb3038fd5c5d46dbc71f1876a71c1',
            'Beef Biryani' => 'https://images.pexels.com/photos/36885754/pexels-photo-36885754.jpeg?auto=compress&cs=tinysrgb&w=900',
            'Mutton Biryani' => 'https://antera.com.au/assets/images/dishes/mutton_biryani.jpg',
            'Special Biryani' => 'https://images.deliveryhero.io/image/fd-sg/products/42241584.jpg?width=%25s',
            'Chicken Fried Rice' => 'https://assets.st-note.com/img/1673140816498-PukCJ7Ecek.jpg?fit=bounds&height=2000&quality=85&width=2000',
            'Beef Fried Rice' => 'https://www.nicolerecipe.com/wp-content/uploads/2025/05/Beef-Fried-Rice.jpg',
            'Egg Fried Rice' => 'https://images.pexels.com/photos/28503581/pexels-photo-28503581.jpeg?auto=compress&cs=tinysrgb&w=900',
            'Mixed Fried Rice' => 'https://c.ndtvimg.com/2025-12/ksgjqctk_chicken-fried-rice-recipe_384x384_17_December_25.jpeg',
            'Seafood Fried Rice' => 'https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com/media/food_pics_v2/medium/seafood_fried_rice.jpg',
            'Chicken Kothu' => 'https://static.wixstatic.com/media/2c5798_5a26efced0804cbe897cd04e7927bd3b~mv2.jpg/v1/fill/w_618%2Ch_686%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01/2c5798_5a26efced0804cbe897cd04e7927bd3b~mv2.jpg',
            'Beef Kothu' => 'https://www.jaffnalove.com/2476-large_default/beef-kothu-roti.jpg',
            'Egg Kothu' => 'https://www.jaffnalove.com/2474-large_default/egg-kothu-roti.jpg',
            'Cheese Kothu' => 'https://mrkottu.lk/images/kottu-cheese.jpg',
            'Special Kothu' => 'https://www.pastimahiyangana.lk/images/menu/kottu/seafood-dolpin-kottu.webp',
            'Fried Chicken (2 Pcs)' => 'https://awsimages.detik.net.id/community/media/visual/2024/04/21/ini-daftar-tahta-tertinggi-ayam-krispi-yang-renyah-dan-murah-1.jpeg?w=1200',
            'Grill Chicken (Half)' => 'https://images.pexels.com/photos/34463131/pexels-photo-34463131.jpeg?auto=compress&cs=tinysrgb&w=900',
            'Grill Chicken (Full)' => 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85',
            'Chicken Wings (6 Pcs)' => 'https://sinnvollgastro.ch/media/images/Chicken-Run/Chicken-Run_Chicken-Wings_web.jpg',
            'French Fries' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85',
            'Chicken Nuggets (6 Pcs)' => 'https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com/media/food_pics_v2/medium/mcnuggets.jpg',
            'Chicken Samosa (1 Pc)' => 'https://ganeshaeksanskriti.com/cdn/shop/files/Samosa.jpg?v=1705398263&width=533',
            'Vegetable Samosa (1 Pc)' => 'https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI2LTAzL3NyLWltYWdlLTE3MDMyMDI2LXRhMTItcy0wMThfMS5qcGc.jpg',
            'Fish Cutlet (1 Pc)' => 'https://d1wvfb9o4f1cvo.cloudfront.net/2021/09/Cutlets.jpg',
            'Egg Roll (1 Pc)' => 'https://www.hungrylankan.com/wp-content/uploads/2020/08/new-fea-768x1024.jpg',
            'Parotta (1 Pc)' => 'https://images.unsplash.com/photo-1619714604987-2f6caead7850?auto=format&fit=crop&w=900&q=85',
            'Egg (1 Pc)' => 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=85',
            'Raita' => 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=900&q=85',
            'Gravy' => 'https://pd.w.org/2026/04/86069e7be508981e2.46727664-768x576.jpg',
        ];

        foreach ($items as $itemIndex => $item) {
            $items[$itemIndex]['image_url'] = $imageUrls[$item['name']];
        }

        DB::transaction(function () use ($items): void {
            $menuNames = array_column($items, 'name');

            foreach ($items as $item) {
                FoodItem::updateOrCreate(['name' => $item['name']], $item);
            }

            FoodItem::whereNotIn('name', $menuNames)->delete();
        });
    }
}
