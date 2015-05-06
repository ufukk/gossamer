##PROJENİN HEDEFİ

Webdeki genele açık kaynakları asgari gecikme ile kaynağın kendisindeki veri bütünlüğünü koruyarak okumak. 

		"Veri ile birçok şey yapılabilir ancak her zaman güncel veriye sahip olmak gerekiyor."

------
------

###Sorun

Sosyal ağların genele açık API'leri ile içerik üreten web sitelerinin RSS vb. kaynakları, içeriklerini makinelerin okuyabileceği biçimde sunuyor. Ancak her kaynak, verilerini kendine özgü veri hiyerarşisine göre biçimlendiriyor. Bu durumda farklı kaynaklardan okunan veriler içeriğe dönüştürülmek istenir ise, kaynaktaki diğer içeriklerden ayrık, tek seviyeli bir sınıflandırmaya tabi oluyorlar. Ayrıca her kaynağın veri sürekliliği olanaklarının farklı olması, kaynaktaki okunmamış verilerin okunmuş olanlardan ayrıştırılıp keşfedilmesini ve okuma işleminin sürdürülmesini güçleştiriyor.

Bunlardan başka, her kaynağın - özellikle sosyal ağların- sürekli altyapı değişiklikleri ve artan hacimlerinin zorunlu kıldığı kullanım kısıtları, donanıma dayalı olanaklardan önce, hataya müsamahalı ve esnek bir veri okuma stratejisine ihtiyaç duyuyor.    

------

Proje; ortak veri biçimlerine (RSS vb.) olduğu gibi kaynaklara özel -ad hoc- geliştirmelere de olanak verecek bir veri okuma stratejisi ile bu verileri içeriğe dönüştürmekte kullanılacak şemalardan oluşacak.

###Veri Okuma

Veri kaynağı olarak, makinenin okuyabileceği türde veri sağlayan API'ler ve RSS'ler kullanılacak. RSS'e sahip olmayan web siteleri de bir tarayıcı kullanılarak okunabilir ancak sınıflandırılmamış veriyi makinenin okuyabileceği biçime dönüştürmek önceki kaynakların ihtiyaç duymayacağı bir katman gerektirir. (screen scraping)

Sosyal ağlar, hem yoğun veri akışı hem de geniş bir veri havuzu sağlıyorlar ancak kendilerine özgü kısıtları ve kuralları, özel geliştirmeleri zorunlu kılıyor.

API sağlayan kaynaklar, 'anahtar kelimeler' üzerinden takip edilecek. Ancak kaynakların sunduğu tüm veri tiplerinde, anahtar kelime takibine olanak vermesi mümkün olamayacağı için, veriler içeriğe dönüştürülürken bir 'full-text' motoru ile işlenecek (Solr) 

####Sınırlar

++Takip edilecek sayfaları/kısımları bulmak ve bu kısımları veri yoğunluklarına ve amaca uygunluklarına göre sıralamak.

++Sosyal ağların kullanım sınırlarını - rate limits - aşmadan azami veriyi toplamak.

++Veri sürekliliğini sağlamak: Hem güncel verileri yayınlandıktan hemen sonra toplamak hem de takip edilen sayfaların/kısımların (gateway?) verilerini geriye doğru da toplayabilmek.

#####Facebook

Facebook Graph API kullanımını üç tür kural grubu ile sınırlıyor; Kullanıcı bazlı kısıtlar, App bazlı kısıtlar ve API Metod bazlı özel kısıtlar. Kullanıcı bazlı kısıtlar, doğrulanmış bir kullanıcının kimliği ile yapılan istekler için geçerli. App bazlı kısıtlar, App üzerinden yapılan kullanıcı kimliği kullanılsın ya da kullanılmasın tüm istekler için geçerli. API metod bazlı özel kısıtlar ise kimi API metodları için, yukarıdakilerden daha dar başka sınırlar getiriyor. Özel sınırlar içeren metodlara örnekler: "feed post and get, comment, event, checkin, search, payment"

Bunlardan başka Facebook kullanım sınırlarını istek sayısı ile değil, her bir isteğin harcadığı sistem kaynaklarına göre belirliyor ve bu çerçeveyi açıklamıyor. Sınırlara takılmamak için önerilen; istekleri gruplamak (Batch API), karmaşık isteklerden kaçınmak ve okunan fieldleri asgari sayıya indirmek. Ayrıca API yanıtlarındaki gömülü verileri (Post altındaki User nesneleri vb.) okumamak muhtemelen daha çok istek yapılmasını sağlar.

######Twitter

Twitter sunduğu iki farklı API için farklı sınırlar belirliyor. Search API için kullanıcı ve App bazlı iki tip kural grubu mevcut. Ancak App bazlı kurallar, kullandıkları kullanıcı kimlikleri önemsenmeksizin tüm Search API isteklerini kapsıyor. Search API, 15dk lık pencereler için 15 sorgu olanağı sağlıyor. Servisten dönen tweet sayısı azami 100 olduğu için okunabilecek tweet sayısı da saatte 15 * 100 * 4, günde ise 15 * 100 * 4 * 24 olacak. (Günde yaklaşık 150.000)

Stream API, sürekli ve tek bağlantı olanağı sunuyor ve her bir App için tek bağlantıyı mecbur kılıyor. Her bağlantı azami 400 anahtar kelimeyi takip edebiliyor. Twitter, bir App - bir IP çözümünü öneriyor ancak sık bağlantı kopması - yeniden bağlanma isteği olmaz ise birden çok bağlantı kurup takip edilen anahtar kelimeleri katlamak mümkün olabilir.

######RSS

RSS'i okunacak her web sitesinin sınırları farklı olmasına rağmen, günde birkaç isteğin verileri taze tutmak için yeteceği varsayılabilir. RSS'ler ilk kez okunduklarında, içerik sayfalarının tümünün ayın anda okunmasının doğuracağı sorunlar, RSS'ten toplananan içerik linklerini gecikmeli okuyarak çözülebilir.   




